// Every piece of Hebrew copy in the app lives here. Components import from this file and
// never hold a literal, so the wording can be reviewed - or translated - in one place.
export const strings = {
  brand: 'סל השבוע',

  steps: {
    label: 'שלבי ההזמנה',
    list: 'רשימת קניות',
    summary: 'סיכום הזמנה',
  },

  picker: {
    title: 'הוספת מוצר',
    subtitle: 'בחרו קטגוריה, ואז מוצר מתוכה.',
    category: 'קטגוריה',
    categoryPlaceholder: 'בחרו קטגוריה',
    product: 'מוצר',
    productPlaceholder: 'בחרו מוצר',
    productWaiting: 'בחרו קטגוריה קודם',
    quantity: 'כמות',
    decrease: 'הפחתת כמות',
    increase: 'הוספת כמות',
    add: 'הוסף מוצר לסל',
  },

  catalog: {
    loading: 'טוען את הקטלוג',
    failed: 'טעינת הקטלוג נכשלה.',
    retry: 'נסו שוב',
  },

  cart: {
    title: 'הסל שלי',
    empty: 'הסל ריק. בחרו מוצר כדי להתחיל.',
    remove: 'הסרה',
    continue: 'המשך הזמנה',
    orderItems: 'המוצרים בהזמנה',
    countOne: 'מוצר אחד',
    countMany: (count: number) => `${count} מוצרים`,
  },

  summary: {
    title: 'פרטים למשלוח',
    subtitle: 'כל השדות חובה.',
    fullName: 'שם פרטי ומשפחה',
    address: 'כתובת מלאה',
    addressHint: 'רחוב, מספר בית, דירה ועיר',
    email: 'כתובת מייל',
    submit: 'אשר הזמנה',
    submitting: 'שולח',
    back: 'חזרה לרשימה',
  },

  done: {
    title: 'ההזמנה נשלחה',
    body: 'שמרנו את ההזמנה במערכת.',
    orderNumber: 'מספר הזמנה',
    again: 'הזמנה חדשה',
  },

  // Keyed by the codes the orders API returns, so the server never ships user-facing copy.
  errors: {
    required: 'שדה חובה',
    invalid_email: 'כתובת המייל אינה תקינה',
    too_long: 'הערך ארוך מדי',
    empty_cart: 'הסל ריק',
    server_error: 'משהו השתבש בשרת. נסו שוב.',
    network: 'אין תקשורת עם השרת. נסו שוב.',
    fallback: 'הערך אינו תקין',
  } as Record<string, string>,
};
