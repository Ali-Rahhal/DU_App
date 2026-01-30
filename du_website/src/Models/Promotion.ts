// {
//     "promotion_id": "1674470023710",
//     "promotion_code": "1674470023710",
//     "condition_type": 0,
//     "promotion_type": 5,
//     "priority": 0,
//     "start_date": "2023-01-01T00:00:00.000Z",
//     "end_date": "2026-02-28T23:59:59.000Z",
//     "description": "NEXCARE 656 20",
//     "alt_description": "NEXCARE 656 20",
//     "is_active": true,
//     "date_added": "2023-01-23T10:33:43.710Z",
//     "last_edited": "2023-03-24T13:39:52.965Z",
//     "erp_promotion_code": "",
//     "cost_center_code": null,
//     "is_processed": null,
//     "applied_on_closing": true,
//     "period_type": -1,
//     "condition_period": 0,
//     "result_period": 0,
//     "apply_count": 0,
//     "is_limited": false,
//     "hide_from_promotion_list": false,
//     "is_instant": false,
//     "conditions": [
//       {
//         "promotion_condition_id": "1674470151198",
//         "promotion_header_id": "1674470092992",
//         "promotion_id": "1674470023710",
//         "condition_type": 1,
//         "condition_type_code": "P350043",
//         "amount_type": 1,
//         "amount_type_code": "Ea",
//         "amount": 4,
//         "amount_range_end": null,
//         "conversion_strategy": 2,
//         "including_tax": false,
//         "is_active": true,
//         "date_added": "2023-01-23T10:35:51.198Z",
//         "last_edited": "2023-01-23T10:35:51.198Z",
//         "description": "\"4 Ea\" of \"656-20 NEXCARE SHEER  BANDAGES 72X25 20/BOX\"",
//         "is_processed": null,
//         "amount_range_start": null
//       }
//     ],
//     "results": [
//       {
//         "promotion_result_id": "1674470174240",
//         "promotion_header_id": "1674470092992",
//         "promotion_id": "1674470023710",
//         "result_type": 1,
//         "result_type_code": "P350043",
//         "effect_target": 1,
//         "result_amount_type": 1,
//         "result_amount_type_code": "Ea",
//         "action_type": 3,
//         "action_type_code": "",
//         "action_value": "1",
//         "is_active": true,
//         "date_added": "2023-01-23T10:36:14.240Z",
//         "last_edited": "2023-01-23T10:36:14.240Z",
//         "description": "\"1 Ea\" of \"656-20 NEXCARE SHEER  BANDAGES 72X25 20/BOX\"",
//         "is_processed": null,
//         "action_amount": null
//       }
//     ]
//   }

type Condition = {
  item_description: string;
  promotion_condition_id: string;
  promotion_header_id: string;
  promotion_id: string;
  condition_type: number;
  condition_type_code: string;
  amount_type: number;
  amount_type_code: string;
  amount: number;
  amount_range_end: string;
  conversion_strategy: number;
  including_tax: boolean;
  is_active: boolean;
  date_added: string;
  last_edited: string;
  description: string;
  is_processed: string;
  amount_range_start: string;
  images: string[];
};
type Result = {
  item_description: string;
  promotion_result_id: string;
  promotion_header_id: string;
  promotion_id: string;
  result_type: number;
  result_type_code: string;
  effect_target: number;
  result_amount_type: number;
  result_amount_type_code: string;
  action_type: number;
  action_type_code: string;
  action_value: string;
  is_active: boolean;
  date_added: string;
  last_edited: string;
  description: string;
  is_processed: string;
  action_amount: string;
  images: string[];
};

export type Promotion = {
  promotion_id: string;
  promotion_code: string;
  condition_type: number;
  promotion_type: number;
  priority: number;
  start_date: string;
  end_date: string;
  description: string;
  alt_description: string;
  is_active: boolean;
  date_added: string;
  last_edited: string;
  erp_promotion_code: string;
  cost_center_code: string;
  is_processed: string;
  applied_on_closing: boolean;
  period_type: number;
  condition_period: number;
  result_period: number;
  apply_count: number;
  is_limited: boolean;
  hide_from_promotion_list: boolean;
  is_instant: boolean;
  conditions: Condition[];
  results: Result[];
};
