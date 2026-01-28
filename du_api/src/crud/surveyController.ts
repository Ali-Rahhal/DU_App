import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
const getSurveys = async () => {
  // AND CONVERT(DATE, GETDATE())
  //       BETWEEN CONVERT(DATE, sti.start_date) AND CONVERT(DATE, sti.end_date)
  const surveys = await prisma.survey_template_instance.findMany({
    where: {
      is_active: true,
      is_web_survey: true,
      //   start_date: {
      //     lte: new Date(),
      //   },
      //   end_date: {
      //     gte: new Date(),
      //   },
    },
    select: {
      description: true,
      survey_template_instance_id: true,
    },
  });
  return surveys.map((survey) => {
    return {
      id: survey.survey_template_instance_id,
      name: survey.description,
    };
  });
};

const getSurveyElements = async (surveyId: number) => {
  const elements: any = await prisma.$queryRaw`
  DECLARE @lang NVARCHAR(2) = 'EN';

      SELECT [title] = sti.description,
             [description] = CASE
                                 WHEN @lang = 'EN' THEN
                                     N'Please Answer Some Questions to help Us improve our services'
                                 WHEN @lang = 'FR' THEN
                                     N'Veuillez répondre à quelques questions pour nous aider à améliorer nos services'
                                 WHEN @lang = 'AR' THEN
                                     N'الرجاء الإجابة على بعض الأسئلة لمساعدتنا على تحسين خدماتنا'
                             END,
             [page_name] = sst.description,
             [question_type_id] = sq.question_type_id,
             [question_type] = sqt.json_description,
             [question_id] = sq.survey_question_id,
             [question_title] = sq.description,
             [input_type] = CASE
                                WHEN sq.question_type_id = 2 THEN
                                    'number'
                                WHEN sq.question_type_id = 5 THEN
                                    'date'
                                WHEN sq.question_type_id = 6 THEN
                                    'time'
                                ELSE
                                    NULL
                            END,
             [is_required] = sstsq.is_mandatory,
             [rate_min] = CASE
                              WHEN sq.question_type_id = 10 THEN
                                  sq.min_val
                              ELSE
                                  NULL
                          END,
             [rate_max] = CASE
                              WHEN sq.question_type_id = 10 THEN
                                  sq.max_val
                              ELSE
                                  NULL
                          END,
             [accepted_types] = CASE
                                    WHEN sq.question_type_id = 14 THEN
                                        'image'
                                    ELSE
                                        NULL
                                END,
             [page_sort_order] = stsst.sort_order,
             [question_sort_order] = sstsq.sort_order
      FROM dbo.survey_subject_template_survey_question AS sstsq
          JOIN dbo.survey_subject_template AS sst
              ON sst.survey_subject_template_id = sstsq.survey_subject_template_id
          JOIN dbo.survey_template_survey_subject_template AS stsst
              ON stsst.survey_subject_template_id = sst.survey_subject_template_id
          JOIN dbo.survey_template_instance AS sti
              ON sti.survey_template_id = stsst.survey_template_id
          JOIN dbo.survey_question AS sq
              ON sq.survey_question_id = sstsq.survey_question_id
          JOIN dbo.survey_question_type AS sqt
              ON sqt.survey_question_type_id = sq.question_type_id
      WHERE sstsq.is_active = 1
            AND sst.is_active = 1
            AND sti.is_active = 1
            AND sq.is_active = 1
            AND sti.is_web_survey = 1
            AND sti.survey_template_instance_id = ${surveyId}
      ORDER BY stsst.sort_order,
               sstsq.sort_order;
  `;
  const choices: any = await prisma.$queryRaw`

      SELECT DISTINCT
             question_id = sq.survey_question_id,
             choice = sao.description
      FROM dbo.survey_subject_template_survey_question AS sstsq
          JOIN dbo.survey_subject_template AS sst
              ON sst.survey_subject_template_id = sstsq.survey_subject_template_id
          JOIN dbo.survey_template_survey_subject_template AS stsst
              ON stsst.survey_subject_template_id = sst.survey_subject_template_id
          JOIN dbo.survey_template_instance AS sti
              ON sti.survey_template_id = stsst.survey_template_id
          JOIN dbo.survey_question AS sq
              ON sq.survey_question_id = sstsq.survey_question_id
          JOIN dbo.survey_answer_option AS sao
              ON sao.survey_question_id = sq.survey_question_id
      WHERE sstsq.is_active = 1
            AND sst.is_active = 1
            AND sti.is_active = 1
            AND sq.is_active = 1
            AND sti.is_web_survey = 1
            AND sti.survey_template_instance_id =${surveyId}
            AND sao.is_active = 1
            AND sq.question_type_id IN ( 12, 13, 7, 8 )
      ORDER BY sq.survey_question_id;
      `;

  // public class DataSurveyModel
  // {
  //     public string title { get; set; }
  //     public string description { get; set; }
  //     public List<SurveyPage> pages { get; set; }
  // }
  // public class SurveyPage
  // {
  //     public string name { get; set; }
  //     public List<SurveyElement> elements { get; set; }
  // }
  // public class SurveyElement
  // {
  //     public string type { get; set; }
  //     public string name { get; set; }
  //     public string title { get; set; }
  //     public string inputType { get; set; }
  //     public bool isRequired { get; set; }
  //     public int? rateMin { get; set; }
  //     public int? rateMax { get; set; }
  //     public string acceptedTypes { get; set; }
  //     public List<string> choices { get; set; }
  // }

  const dataSurvey = {
    title: elements[0].title,
    description: elements[0].description,
    pages: elements.reduce((acc: any, element: any) => {
      const page = acc.find((p: any) => p.name === element.page_name);
      if (!page) {
        acc.push({
          name: element.page_name,
          elements: [
            {
              type: element.question_type,
              name: element.question_id,
              title: element.question_title,
              inputType: element.input_type,
              isRequired: element.is_required,
              rateMin: element.rate_min,
              rateMax: element.rate_max,
              acceptedTypes: element.accepted_types,
              choices: choices
                .filter(
                  (choice: any) => choice.question_id === element.question_id
                )
                .map((choice: any) => choice.choice),
            },
          ],
        });
      } else {
        page.elements.push({
          type: element.question_type,
          name: element.question_id,
          title: element.question_title,
          inputType: element.input_type,
          isRequired: element.is_required,
          rateMin: element.rate_min,
          rateMax: element.rate_max,
          acceptedTypes: element.accepted_types,
          choices: choices
            .filter((choice: any) => choice.question_id === element.question_id)
            .map((choice: any) => choice.choice),
        });
      }
      return acc;
    }, []),
  };

  return {
    ...dataSurvey,
  };
};

const getProductsSurvey = async ({
  take,
  skip,
  search,
}: {
  take: number;
  skip: number;
  search: string;
}) => {
  const searchFilter = search
    ? Prisma.sql`AND it.description LIKE ${`%${search}%`}`
    : Prisma.empty;
  const countQuery = Prisma.sql`SELECT DISTINCT count(*) as count
        FROM item as it      
        WHERE it.is_active = 1
        AND it.status = 1
        ${searchFilter}
        `;
  const count = await prisma.$queryRaw(countQuery);
  const res: [] = await prisma.$queryRaw<[]>`
    SELECT
      value=it.item_code,
      text=it.description
      FROM item as it
      Where it.is_active = 1 AND it.status = 1
        ${searchFilter}
        ORDER BY date_added DESC
        OFFSET ${skip} ROWS FETCH NEXT ${take} ROWS ONLY
        `;
  return { items_count: count[0].count, products: res };
};
const saveSurveyAnswer = async (
  surveyId: number,
  answers: {
    key: string;
    value: string;
    question_type_id: number;
    type: string;
  }[],
  userId: number
) => {
  const user = await prisma.web_accounts.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) throw new Error("User not found");
  const code = user?.code;
  const query = Prisma.sql`
  SET NOCOUNT ON;

  DECLARE @transaction_name NVARCHAR(250) = N'NG_ECOM_SAVE_SURVEY_ANSWERS';
  DECLARE @output_err_code INT = 0;
  DECLARE @output_err_msg NVARCHAR(250) = N'';
  DECLARE @current_language NVARCHAR(10) = 'en'; -- Example language setting

  BEGIN TRANSACTION @transaction_name;

  BEGIN TRY
      -- Create a temporary table to hold the survey answers
      CREATE TABLE #survey_answers (
          [KEY] NVARCHAR(250),
          VALUE NVARCHAR(250),
          QUESTION_TYPE_ID INT
      );

      -- Insert values into the temporary table
      INSERT INTO #survey_answers ([KEY], VALUE, QUESTION_TYPE_ID)
      VALUES
      ${Prisma.join(
        answers.map(
          (row) =>
            Prisma.sql`(${Prisma.join([
              row.key,
              row.value,
              row.question_type_id,
            ])})`
        )
      )};

      -- Fetch the table name
      DECLARE @table_name NVARCHAR(250) =
      (
          SELECT TOP 1
              sti.table_name
          FROM dbo.survey_template_instance AS sti
          WHERE sti.survey_template_instance_id = ${surveyId}
              AND sti.is_web_survey = 1
              AND sti.is_active = 1
      );

      -- Construct the dynamic SQL query for the pivot operation
      DECLARE @Query NVARCHAR(MAX) = N'';
      DECLARE @columns NVARCHAR(MAX);
      SELECT @columns = COALESCE(@columns + ', ', '') + QUOTENAME([KEY])
      FROM #survey_answers;

      SET @Query = N'SELECT *,
          client_code = @code,
          date_added = GETDATE()
      INTO #temp
      FROM
      (
          SELECT [KEY], VALUE FROM #survey_answers
      ) AS src
      PIVOT
      (
          MAX(VALUE)
          FOR [KEY] IN (' + @columns + N')
      ) AS pivot_table;';

      -- Construct the final dynamic SQL query for inserting data into the target table
      DECLARE @DynamicSQL NVARCHAR(MAX) = N'INSERT INTO dbo.' + @table_name + N' (';
      SELECT @DynamicSQL = @DynamicSQL + QUOTENAME('quest_' + [KEY]) + N', '
      FROM #survey_answers;

      SET @DynamicSQL = LEFT(@DynamicSQL, LEN(@DynamicSQL) - 1) + N', client_code, date_added) SELECT * from #temp;';

      -- Combine the queries
      DECLARE @ResQuery NVARCHAR(MAX) = @Query + @DynamicSQL;

      -- Execute the dynamic SQL query
      EXEC sp_executesql @ResQuery, 
          N'@code NVARCHAR(50)', 
          @code = ${code};

      -- Set output messages
      SET @output_err_code = 0;
      SET @output_err_msg = CASE
          WHEN @current_language = 'en' THEN N'Answers successfully uploaded.'
          WHEN @current_language = 'fr' THEN N'Réponses téléchargées avec succès.'
          ELSE N'تم تحميل الإجابات بنجاح.'
      END;

      -- Commit the transaction
      COMMIT TRANSACTION @transaction_name;
  END TRY
  BEGIN CATCH
      -- Rollback the transaction and set error messages
      SET @output_err_code = -1;
      SET @output_err_msg = CASE
          WHEN @current_language = 'en' THEN N'Error when uploading answers.'
          WHEN @current_language = 'fr' THEN N'Erreur lors du téléchargement des réponses.'
          ELSE N'خطأ عند تحميل الإجابات.'
      END;
      SET @output_err_msg = ERROR_MESSAGE();
      ROLLBACK TRANSACTION @transaction_name;
  END CATCH;

    select @output_err_code as output_err_code, @output_err_msg as output_err_msg;
`;
  const saveSurvey = await prisma.$queryRaw(query);
  return saveSurvey;
};

export { getSurveys, getSurveyElements, getProductsSurvey, saveSurveyAnswer };
