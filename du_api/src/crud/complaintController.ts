import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { saveAudioReturnUrl, saveImageReturnUrl } from "../lib/utils";

const getComplaints = async () => {
  const complaints = await prisma.web_complaint_type.findMany({
    where: {
      is_active: true,
    },
    select: {
      web_complaint_type_id: true,
      description: true,
    },
  });
  return complaints.map((complaint) => {
    return {
      id: complaint.web_complaint_type_id,
      name: complaint.description,
    };
  });
};

const getComplaintsElements = async (complaintId: number) => {
  const elements: any = await prisma.$queryRaw`
      SET NOCOUNT ON
  
  
  
      SELECT [title] = wct.description,
             [description] = '',
             [page_name] = '',
             [question_type_id] = wcct.web_complaint_component_type_id,
             [question_type] = wcct.json_description,
             [question_id] = wctc.web_complaint_type_component_id,
             [question_title] = wctc.description,
             [input_type] = CASE
                                WHEN wcct.web_complaint_component_type_id = 2 THEN
                                    'number'
                                WHEN wcct.web_complaint_component_type_id = 3 THEN
                                    'date'
                                WHEN wcct.web_complaint_component_type_id = 4 THEN
                                    'time'
                                ELSE
                                    NULL
                            END,
             [is_required] = wctc.is_required,
             [rate_min] = CASE
                              WHEN wcct.web_complaint_component_type_id = 2 THEN
                                  0
                              ELSE
                                  NULL
                          END,
             [rate_max] = CASE
                              WHEN wcct.web_complaint_component_type_id = 2 THEN
                                  1000
                              ELSE
                                  NULL
                          END,
             [accepted_types] = CASE
                                    WHEN wcct.web_complaint_component_type_id = 9 THEN
                                        'image'
                                    ELSE
                                        NULL
                                END,
             [page_sort_order] = 0,
             [question_sort_order] = wctc.order_sequence
      FROM dbo.web_complaint_type AS wct
          JOIN dbo.web_complaint_type_components AS wctc
              ON wctc.web_complaint_type_id = wct.web_complaint_type_id
          JOIN dbo.web_complaint_component_type AS wcct
              ON wcct.web_complaint_component_type_id = wctc.web_complaint_component_type_id
      WHERE wct.is_active = 1
            AND wctc.is_active = 1
            AND wcct.is_active = 1
            AND wct.web_complaint_type_id = ${complaintId}
      ORDER BY wctc.order_sequence ASC;
  
  `;
  const choices: any = await prisma.$queryRaw`
  
  SELECT DISTINCT
  question_id = wctc.web_complaint_type_component_id,
  choice = wctco.description
  FROM dbo.web_complaint_type AS wct
  JOIN dbo.web_complaint_type_components AS wctc
   ON wctc.web_complaint_type_id = wct.web_complaint_type_id
  JOIN dbo.web_complaint_component_type AS wcct
   ON wcct.web_complaint_component_type_id = wctc.web_complaint_component_type_id
  JOIN dbo.web_complaint_type_component_options AS wctco
   ON wctco.web_complaint_type_component_id = wctc.web_complaint_type_component_id
  WHERE wctc.is_active = 1
  AND wct.is_active = 1
  AND wctco.is_active = 1
  AND wcct.is_active = 1
  AND wct.web_complaint_type_id = ${complaintId}
  AND wcct.web_complaint_component_type_id IN ( 5, 6 );
  `;

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

const saveComplaintAnswer = async (
  complaintId: number,
  answers: {
    key: string;
    value: string;
    question_type_id: number;
    type: string;
  }[],
  userId: number
) => {
  try {
    const user = await prisma.web_accounts.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new Error("User not found");
    const answersAfterProcessing = [];
    answers.forEach(async (answer) => {
      if (answer.type === "file") {
        await saveImageReturnUrl(answer.value).then((url) => {
          answersAfterProcessing.push({
            key: answer.key,
            value: url.path,
            question_type_id: answer.question_type_id,
          });
        });
      } else if (answer.type === "microphone") {
        await saveAudioReturnUrl(answer.value).then((url) => {
          answersAfterProcessing.push({
            key: answer.key,
            value: url.path,
            question_type_id: answer.question_type_id,
          });
        });
      } else {
        answersAfterProcessing.push(answer);
      }
    });

    await Promise.all(answersAfterProcessing);

    const code = user?.code;
    const query = Prisma.sql`
    SET NOCOUNT ON;
  
    DECLARE @transaction_name NVARCHAR(250) = N'NG_ECOM_SAVE_COMPLAINT_ANSWERS';
    DECLARE @output_err_code INT = 0;
    DECLARE @output_err_msg NVARCHAR(250) = N'';
    DECLARE @current_language NVARCHAR(10) = 'en'; -- Example language setting
  
    BEGIN TRANSACTION @transaction_name;
  
    BEGIN TRY
    
    DECLARE @sequence BIGINT =
                (
                    SELECT ISNULL(MAX(wc.sequence), 0) + 1 FROM dbo.web_complaint AS wc
                );

     DECLARE @complaint_code NVARCHAR(50) = FORMAT(@sequence, 'C000000000#');


     INSERT INTO dbo.web_complaint
        (
            web_complaint_code,
            web_complaint_type_id,
            client_code,
            description,
            assigned_type,
            assigned_code,
            start_date,
            end_date,
            status,
            priority_id,
            is_overdue,
            is_user_notified,
            sequence,
            creator_user_code,
            last_modifier_user_code,
            is_active,
            date_added,
            last_edited,
            is_overdue_notified
        )
        VALUES
        (   @complaint_code,    
            ${complaintId}, 
            ${code},            
            N'',                
            -1,               
            N'-1',            
            GETDATE(),         
            NULL,             
            0,                 
            0,                
            0,                 
            0,                
            @sequence,          
            NULL,               
            NULL,          
            1,                 
            GETDATE(),          
            GETDATE(),          
            0                   
            );
           DECLARE @complaint_id BIGINT = SCOPE_IDENTITY();

select @complaint_id as complaint_id;
     CREATE TABLE #answers (
          [KEY] NVARCHAR(250),
          VALUE NVARCHAR(250),
          QUESTION_TYPE_ID INT
      );

      INSERT INTO #answers ([KEY], VALUE, QUESTION_TYPE_ID)
      VALUES
      ${Prisma.join(
        answersAfterProcessing.map(
          (row) =>
            Prisma.sql`(${Prisma.join([
              row.key,
              row.value,
              row.question_type_id,
            ])})`
        )
      )};



        INSERT INTO [dbo].[web_complaint_data]
           ([web_complaint_id]
           ,[web_complaint_type_component_id]
           ,[data]
           ,[is_active]
           ,[date_added]
           ,[last_edited])
        SELECT @complaint_id,
               CONVERT(BIGINT, a.[KEY]),
               a.[VALUE],
               1,
               GETDATE(),
               GETDATE()
        FROM #answers AS a;

        


        SET @output_err_code = 0;
        SET @output_err_msg = CASE
                                  WHEN @current_language = 'en' THEN
                                      N'Answers successfully uploaded.'
                                  WHEN @current_language = 'fr' THEN
                                      N'Réponses téléchargées avec succès.'
                                  ELSE
                                      N'تم تحميل الإجابات بنجاح.'
                              END;

        COMMIT TRANSACTION @transaction_name;
    END TRY
    BEGIN CATCH

        SET @output_err_code = -1;
        SET @output_err_msg = CASE
                                  WHEN @current_language = 'en' THEN
                                      N'Error when uploading answers.'
                                  WHEN @current_language = 'fr' THEN
                                      N'Erreur lors du téléchargement des réponses.'
                                  ELSE
                                      N'خطأ عند تحميل الإجابات.'
                              END;
        SET @output_err_msg = ERROR_MESSAGE();
        ROLLBACK TRANSACTION @transaction_name;
    END CATCH;
  `;

    const saveComplaint = await prisma.$queryRaw(query);
    return saveComplaint;
  } catch (error) {
    throw new Error(error);
  }
};

// DECLARE @comment NVARCHAR(MAX) =
// (
//     SELECT TOP 1
//            a.VALUE
//     FROM #answers AS a
//         JOIN dbo.web_complaint_type_components AS wctc
//             ON a.[KEY] = wctc.web_complaint_type_component_id
//     WHERE wctc.web_complaint_component_type_id = 1
//           AND wctc.is_active = 1
// );

// INSERT INTO dbo.web_complaint_history
// (
// web_complaint_id,
// status_id,
// comment,
// user_code,
// assigned_type,
// assigned_code,
// is_active,
// date_added,
// last_edited
// )
// VALUES
// (   @complaint_id, -- web_complaint_id - bigint
// 0,             -- status_id - int
// @comment,      -- comment - nvarchar(max)
// NULL,          -- user_code - nvarchar(50)
// -1,            -- assigned_type - int
// N'-1',         -- assigned_code - nvarchar(50)
// 1,             -- is_active - bit
// GETDATE(),     -- date_added - datetime
// GETDATE()      -- last_edited - datetime
// );
const getUserComplaints = async (userId: number) => {
  const user = await prisma.web_accounts.findUnique({
    where: {
      id: userId,
    },
  });
  // const complaints = await prisma.web_complaint.findMany({
  //   where: {
  //     client_code: user?.code,
  //   },
  //   select: {
  //     web_complaint_id: true,
  //     web_complaint_code: true,
  //     web_complaint_type_id: true,
  //     description: true,
  //     assigned_type: true,
  //     assigned_code: true,
  //     start_date: true,
  //     end_date: true,
  //     status: true,
  //     priority_id: true,
  //     is_overdue: true,
  //     is_user_notified: true,
  //     sequence: true,
  //     creator_user_code: true,
  //     last_modifier_user_code: true,
  //     is_active: true,
  //     date_added: true,
  //     last_edited: true,
  //     is_overdue_notified: true,
  //   },
  // });
  const complaints = await prisma.$queryRaw`
  SET NOCOUNT ON;
  select wc.*,complaint_type= wct.description from dbo.web_complaint wc
  left join dbo.web_complaint_type wct on wc.web_complaint_type_id = wct.web_complaint_type_id
  where
   client_code = ${user?.code};
  `;
  return complaints;
};

export {
  saveComplaintAnswer,
  getComplaints,
  getComplaintsElements,
  getUserComplaints,
};
