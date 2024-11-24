import { dbClient } from "."

type AccuracyByOptionIndex = {
  position: number
  modelName: "gpt4o" | "gpt4mini" | "llama" | "all"
  optionType: "Numbered Options" | "Lettered Options" | "Bullet Points" | "all"
  total_count: string
  text_matches: string
  position_percentage: string
  text_match_percentage: string
}

export async function getCorrectAnswerByOptionIndex() {
  const results = await dbClient.$queryRaw<AccuracyByOptionIndex[]>`
    WITH answer_positions AS (
      -- Unnest the options array with index positions
      SELECT 
        a."questionName",
        a."modelName",
        a."optionType",
        a.options,
        a.text,
        q."correctAnswer",
        element.value,
        element.ordinality - 1 as position
      FROM 
        "Answer" a
        JOIN "MultipleChoiceQuestion" q ON a."questionName" = q.name
        CROSS JOIN LATERAL jsonb_array_elements(a.options::jsonb) WITH ORDINALITY AS element(value, ordinality)
      WHERE
        q."correctAnswer" IS NOT NULL
    ),
    correct_answer_positions AS (
      -- Find the position (0-based index) of correct answers
      SELECT
        "questionName",
        "modelName",
        "optionType",
        options,
        text,
        "correctAnswer",
        position
      FROM 
        answer_positions
      WHERE 
        value::text = to_jsonb("correctAnswer")::text
    ),
    per_model_option_stats AS (
      -- Calculate stats per model and optionType
      SELECT 
        "modelName",
        "optionType",
        position,
        COUNT(*) as total_count,
        SUM(CASE WHEN text = "correctAnswer" THEN 1 ELSE 0 END) as text_matches,
        ROUND(
          COUNT(*)::numeric / (
            SELECT COUNT(*) 
            FROM "Answer" a 
            JOIN "MultipleChoiceQuestion" q ON a."questionName" = q.name 
            WHERE q."correctAnswer" IS NOT NULL 
            AND a."modelName" = cap."modelName" 
            AND a."optionType" = cap."optionType"
          ) * 100,
          2
        ) as position_percentage,
        ROUND(
          SUM(CASE WHEN text = "correctAnswer" THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100,
          2
        ) as text_match_percentage
      FROM 
        correct_answer_positions cap
      GROUP BY 
        "modelName",
        "optionType",
        position
    ),
    all_models_per_option_stats AS (
      -- Calculate stats across all models per optionType
      SELECT 
        'all' as "modelName",
        "optionType",
        position,
        COUNT(*) as total_count,
        SUM(CASE WHEN text = "correctAnswer" THEN 1 ELSE 0 END) as text_matches,
        ROUND(
          COUNT(*)::numeric / (
            SELECT COUNT(*) 
            FROM "Answer" a 
            JOIN "MultipleChoiceQuestion" q ON a."questionName" = q.name 
            WHERE q."correctAnswer" IS NOT NULL 
            AND a."optionType" = cap."optionType"
          ) * 100,
          2
        ) as position_percentage,
        ROUND(
          SUM(CASE WHEN text = "correctAnswer" THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100,
          2
        ) as text_match_percentage
      FROM 
        correct_answer_positions cap
      GROUP BY 
        "optionType",
        position
    ),
    all_options_per_model_stats AS (
      -- Calculate stats across all optionTypes per model
      SELECT 
        "modelName",
        'all' as "optionType",
        position,
        COUNT(*) as total_count,
        SUM(CASE WHEN text = "correctAnswer" THEN 1 ELSE 0 END) as text_matches,
        ROUND(
          COUNT(*)::numeric / (
            SELECT COUNT(*) 
            FROM "Answer" a 
            JOIN "MultipleChoiceQuestion" q ON a."questionName" = q.name 
            WHERE q."correctAnswer" IS NOT NULL 
            AND a."modelName" = cap."modelName"
          ) * 100,
          2
        ) as position_percentage,
        ROUND(
          SUM(CASE WHEN text = "correctAnswer" THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100,
          2
        ) as text_match_percentage
      FROM 
        correct_answer_positions cap
      GROUP BY 
        "modelName",
        position
    ),
    all_all_stats AS (
      -- Calculate stats across all models and all optionTypes
      SELECT 
        'all' as "modelName",
        'all' as "optionType",
        position,
        COUNT(*) as total_count,
        SUM(CASE WHEN text = "correctAnswer" THEN 1 ELSE 0 END) as text_matches,
        ROUND(
          COUNT(*)::numeric / (
            SELECT COUNT(*) 
            FROM "Answer" a 
            JOIN "MultipleChoiceQuestion" q ON a."questionName" = q.name 
            WHERE q."correctAnswer" IS NOT NULL
          ) * 100,
          2
        ) as position_percentage,
        ROUND(
          SUM(CASE WHEN text = "correctAnswer" THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100,
          2
        ) as text_match_percentage
      FROM 
        correct_answer_positions
      GROUP BY 
        position
    )
    -- Combine all stats
    SELECT *
    FROM (
      SELECT * FROM per_model_option_stats
      UNION ALL
      SELECT * FROM all_models_per_option_stats
      UNION ALL
      SELECT * FROM all_options_per_model_stats
      UNION ALL
      SELECT * FROM all_all_stats
    ) combined
    ORDER BY 
      position,
      CASE 
        WHEN "modelName" = 'all' AND "optionType" = 'all' THEN 3
        WHEN "modelName" = 'all' THEN 2
        WHEN "optionType" = 'all' THEN 1
        ELSE 0
      END,
      "modelName",
      "optionType";
  `

  return results.map((row: any) => ({
    position: Number(row.position),
    modelName: row.modelName,
    optionType: row.optionType,
    totalCount: Number(row.total_count),
    correctCount: Number(row.text_matches),
    positionPercentage: Number(row.position_percentage),
    correctAnswerPercentage: Number(row.text_match_percentage),
  }))
}

export interface OpinionsByOptionIndex extends AccuracyByOptionIndex {
  modelName: "gpt4o" | "gpt4mini" | "llama" | "all"
  optionType: "Numbered Options" | "Lettered Options" | "Bullet Points" | "all"
  optionPosition: number
  matchCount: number
}

export async function opinionsByOptionIndex() {
  const results = await dbClient.$queryRaw<OpinionsByOptionIndex[]>`
    WITH numbers AS (
      SELECT 0 as idx UNION ALL 
      SELECT 1 UNION ALL 
      SELECT 2 UNION ALL 
      SELECT 3
    ), 
    specific_counts AS (
      SELECT 
        a."modelName",
        a."optionType",
        n.idx as option_position,
        COUNT(*) as match_count
    FROM numbers n
    LEFT JOIN "Answer" a ON trim(both '"' from (a.options->n.idx)::text) = a.text
    JOIN "MultipleChoiceQuestion" q ON a."questionName" = q.name
    WHERE q.type = 'opinion'
    GROUP BY a."modelName", a."optionType", n.idx
    ),
    model_counts AS (
      SELECT 
        a."modelName",
        'all' as "optionType",
        n.idx as option_position,
        COUNT(*) as match_count
      FROM numbers n
      LEFT JOIN "Answer" a ON trim(both '"' from (a.options->n.idx)::text) = a.text
      JOIN "MultipleChoiceQuestion" q ON a."questionName" = q.name
      WHERE q.type = 'opinion'
      GROUP BY a."modelName", n.idx
    ),
    all_counts AS (
      SELECT 
        'all' as "modelName",
        'all' as "optionType",
        n.idx as option_position,
        COUNT(*) as match_count
      FROM numbers n
      LEFT JOIN "Answer" a ON trim(both '"' from (a.options->n.idx)::text) = a.text
      JOIN "MultipleChoiceQuestion" q ON a."questionName" = q.name
      WHERE q.type = 'opinion'
      GROUP BY n.idx
    )
    SELECT * FROM specific_counts
    UNION ALL
    SELECT * FROM model_counts
    UNION ALL
    SELECT * FROM all_counts
    ORDER BY "modelName", "optionType", option_position;
  `

  return results
}
