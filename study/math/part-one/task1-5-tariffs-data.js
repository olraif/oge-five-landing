(function initTariffsData(root, factory) {
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  if (root) root.OgeTaskOneToFiveTariffs = data;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createTariffsData() {
  const IMAGE_PATH = '/drawings/FIPI_OGE_MATH/real_math/tariffs-1.svg';

  const numberText = (value) => String(value).replace('.', ',');

  const baseCondition = (spec) => `
    <p>На графике показаны минуты исходящих вызовов и объём мобильного интернета, использованные ${spec.person} в каждом месяце 2025 года. Сплошная линия соответствует минутам, пунктирная — гигабайтам.</p>
    <div class="table-wrapper">
      <table class="latex-table table-with-image">
        <tr><th><div class="center"><img src="${IMAGE_PATH}" width="503" height="292" alt="График использования мобильной связи"></div></th></tr>
      </table>
    </div>
    <p>${spec.person} пользуется тарифом «${spec.plan}» с абонентской платой <strong>${spec.fee} рублей в месяц</strong>. В неё входят:</p>
    <ul>
      <li>${spec.minutes} минут исходящих вызовов;</li>
      <li>${numberText(spec.gigabytes)} ГБ мобильного интернета;</li>
      <li>безлимитные входящие вызовы.</li>
    </ul>
    <p>После исчерпания пакета исходящая минута стоит ${spec.minuteCost} руб. Дополнительный интернет оплачивается пакетами по 0,5 ГБ стоимостью ${spec.halfGigabyteCost} рублей; неполный пакет округляется до целого. Лимит SMS во все месяцы соблюдён.</p>
  `;

  const lookupQuestion = (lookup) => `
    <p>По графику определите номера месяцев для указанных значений. Запишите номера подряд в том же порядке, без пробелов и разделителей.</p>
    <div class="table-wrapper">
      <table class="latex-table">
        <tr><th>${lookup.title}</th>${lookup.values.map((value) => `<th>${value}</th>`).join('')}</tr>
        <tr><td><strong>Номер месяца</strong></td>${lookup.values.map(() => '<td></td>').join('')}</tr>
      </table>
    </div>
  `;

  const mobileOfferQuestion = (spec, offer) => `
    <p>Оператор предложил ${spec.personDative} перейти на тариф «${offer.name}». Его условия приведены в таблице.</p>
    <div class="table-wrapper">
      <table class="latex-table">
        <tr><th>Абонентская плата</th><th>${offer.fee} руб. в месяц</th></tr>
        <tr><td>Включено исходящих минут</td><td>${offer.minutes}</td></tr>
        <tr><td>Включено мобильного интернета</td><td>${numberText(offer.gigabytes)} ГБ</td></tr>
        <tr><td>Минута сверх пакета</td><td>${offer.minuteCost} руб.</td></tr>
        <tr><td>Дополнительные 0,5 ГБ</td><td>${offer.halfGigabyteCost} руб.</td></tr>
        <tr><td>Стоимость перехода</td><td>0 руб.</td></tr>
      </table>
    </div>
    <p>Сравните расходы за все 12 месяцев по графику. Если новый тариф дешевле, ${spec.person} перейдёт на него; иначе сохранит тариф «${spec.plan}». В ответе укажите ежемесячную абонентскую плату выбранного тарифа.</p>
  `;

  const internetOfferQuestion = (spec, target, offers) => `
    <p>${spec.person} выбирает домашний интернет для предполагаемого расхода <strong>${target} МБ в месяц</strong>. Условия трёх предложений приведены в таблице.</p>
    <div class="table-wrapper">
      <table class="latex-table">
        <tr><th>Тариф</th><th>Абонентская плата</th><th>Плата за трафик сверх пакета</th></tr>
        ${offers.map((offer) => `
          <tr>
            <td>«${offer.name}»</td>
            <td>${offer.included ? `${offer.fee} руб. за ${offer.included} МБ` : 'нет'}</td>
            <td>${numberText(offer.extraCost)} руб. за 1 МБ${offer.included ? ` сверх ${offer.included} МБ` : ''}</td>
          </tr>
        `).join('')}
      </table>
    </div>
    <p>Сколько рублей заплатит ${spec.person}, выбрав самое дешёвое предложение при таком расходе?</p>
  `;

  const SPECS = [
    {
      person: 'Марина', personDative: 'Марине', plan: 'Вектор', fee: 420,
      minutes: 300, gigabytes: 3, minuteCost: 2, halfGigabyteCost: 80,
      lookup: { title: 'Мобильный интернет', values: ['3,25 ГБ', '1 ГБ', '2,75 ГБ', '4 ГБ'] },
      prompts: [
        'Сколько рублей составили расходы Марины на мобильную связь в апреле?',
        'Сколько месяцев Марина не превышала одновременно ни пакет минут, ни пакет мобильного интернета?',
        'На сколько процентов увеличился интернет-трафик в августе по сравнению с июлем?',
      ],
      offer: { name: 'Вектор Плюс', fee: 480, minutes: 350, gigabytes: 4, minuteCost: 1, halfGigabyteCost: 70 },
      answers: { 1: '10724', 2: '680', 3: '4', 4: '50', 5: '480' },
    },
    {
      person: 'Илья', personDative: 'Илье', plan: 'Баланс', fee: 390,
      minutes: 325, gigabytes: 2.5, minuteCost: 3, halfGigabyteCost: 70,
      lookup: { title: 'Мобильный интернет', values: ['1,5 ГБ', '3,75 ГБ', '2 ГБ', '3 ГБ'] },
      prompts: [
        'Сколько рублей составили расходы Ильи на мобильную связь в ноябре?',
        'Сколько месяцев Илья превысил одновременно и пакет минут, и пакет мобильного интернета?',
        'В 2024 году плата за тариф составляла 300 рублей. На сколько процентов она выросла в 2025 году?',
      ],
      offer: { name: 'Баланс Макси', fee: 430, minutes: 400, gigabytes: 4, minuteCost: 2, halfGigabyteCost: 60 },
      answers: { 1: '81136', 2: '600', 3: '2', 4: '30', 5: '430' },
    },
    {
      person: 'София', personDative: 'Софии', plan: 'Пульс', fee: 360,
      minutes: 300, gigabytes: 3.5, minuteCost: 4, halfGigabyteCost: 100,
      lookup: { title: 'Исходящие вызовы', values: ['375 мин.', '150 мин.', '300 мин.', '175 мин.'] },
      prompts: [
        'Сколько рублей составили расходы Софии на мобильную связь в июле?',
        'Сколько месяцев расходы Софии на связь составляли ровно 360 рублей?',
        'В 2025 году плата за тариф выросла на 20% по сравнению с 2024 годом. Сколько рублей составляла прежняя плата?',
      ],
      offer: { name: 'Пульс 450', fee: 450, minutes: 350, gigabytes: 4, minuteCost: 3, halfGigabyteCost: 90 },
      answers: { 1: '7351', 2: '660', 3: '5', 4: '300', 5: '450' },
    },
    {
      person: 'Артём', personDative: 'Артёму', plan: 'Спектр', fee: 450,
      minutes: 350, gigabytes: 3, minuteCost: 5, halfGigabyteCost: 90,
      lookup: { title: 'Исходящие вызовы', values: ['300 мин.', '175 мин.', '375 мин.', '150 мин.'] },
      prompts: [
        'Сколько рублей составили расходы Артёма на мобильную связь в октябре?',
        'Какое наименьшее количество минут исходящих вызовов за месяц показано на графике?',
        'В 2025 году плата за тариф снизилась на 25% по сравнению с 2024 годом. Сколько рублей составляла прежняя плата?',
      ],
      internet: {
        target: 650,
        offers: [
          { name: 'Без пакета', fee: 0, included: 0, extraCost: 1.4 },
          { name: 'Старт 300', fee: 280, included: 300, extraCost: 0.9 },
          { name: 'Макси 700', fee: 640, included: 700, extraCost: 0.45 },
        ],
      },
      answers: { 1: '5173', 2: '540', 3: '150', 4: '600', 5: '595' },
    },
    {
      person: 'Елена', personDative: 'Елене', plan: 'Линия', fee: 400,
      minutes: 300, gigabytes: 3, minuteCost: 2, halfGigabyteCost: 85,
      lookup: { title: 'Исходящие вызовы', values: ['150 мин.', '375 мин.', '175 мин.', '300 мин.'] },
      prompts: [
        'Сколько рублей составили расходы Елены на мобильную связь в феврале?',
        'Какой наименьший объём мобильного интернета в гигабайтах за месяц показан на графике?',
        'С января 2026 года плата за тариф повысилась до 480 рублей. На сколько процентов она увеличилась?',
      ],
      internet: {
        target: 900,
        offers: [
          { name: 'По факту', fee: 0, included: 0, extraCost: 1.2 },
          { name: 'Дом 400', fee: 360, included: 400, extraCost: 0.8 },
          { name: 'Дом 900', fee: 740, included: 900, extraCost: 0.45 },
        ],
      },
      answers: { 1: '3715', 2: '500', 3: '1', 4: '20', 5: '740' },
    },
  ];

  const makeQuestion = (number, html, answer) => ({ number, html, answer, format: 'number' });

  const analogs = SPECS.map((spec, index) => {
    const fifthQuestion = spec.offer
      ? mobileOfferQuestion(spec, spec.offer)
      : internetOfferQuestion(spec, spec.internet.target, spec.internet.offers);
    const questions = [
      makeQuestion(1, lookupQuestion(spec.lookup), spec.answers[1]),
      makeQuestion(2, spec.prompts[0], spec.answers[2]),
      makeQuestion(3, spec.prompts[1], spec.answers[3]),
      makeQuestion(4, spec.prompts[2], spec.answers[4]),
      makeQuestion(5, fifthQuestion, spec.answers[5]),
    ];
    return {
      id: `tariffs-7.1.${index + 1}`,
      label: `7.1.${index + 1}`,
      taskHtml: baseCondition(spec),
      imagePath: IMAGE_PATH,
      answers: Object.fromEntries(questions.map((question) => [String(question.number), String(question.answer)])),
      questions,
    };
  });

  return [{ id: 'tariffs-7.1', number: '7.1', title: 'Тарифы', analogs }];
});
