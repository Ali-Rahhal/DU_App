// {
//     item_code: 'P620020',
//     name: 'ABREMIA 250MG 120 TABLET-NS',
//     description: 'ABREMIA 250MG 120 TABLET-NS',
//     creation_date: '2023-09-12T09:15:02.113Z',
//     price: '133880800',
//     default_discount: 1.69,
//     discountedPrice: '131618214.48',
//     isFavorite: false,
//     images: [ 'http://cloud.quayomobility.ca:15711/images/items/0264.jpg' ],
//     category: 'Pharma',
//     cat_code: 'P',
//     currency_code: 'LBP',
//     barcode: 'P620020',
//     image: 'http://cloud.quayomobility.ca:15711/images/items/0264.jpg',
//     tags: [ 'Pharma', null ]
//   }
type Item = {
  item_code: string;
  name: string;
  description: string;
  creation_date: string;
  price: string;
  default_discount: number;
  discountedPrice: string;
  isFavorite: boolean;
  hasPromotion: boolean;
  images: string[];
  category: string;
  cat_code: string;
  currency_code: string;
  barcode: string;
  image: string;
  tags: string[];
};
export default Item;
