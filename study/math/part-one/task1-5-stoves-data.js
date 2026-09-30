(function initStovesData(root, factory) {
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  if (root) root.OgeTaskOneToFiveStoves = data;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createStovesData() {
  const imagePath = '/drawings/FIPI_OGE_MATH/real_math/stoves-1.svg';
  const specs = [
    {
      room: ['3,2', '2,5', '2,1'],
      cableCost: '7600',
      models: [
        { number: 1, type: 'дровяная', volume: '12–18', mass: 44, price: 22400 },
        { number: 2, type: 'дровяная', volume: '15–22', mass: 52, price: 25800 },
        { number: 3, type: 'электрическая', volume: '14–19', mass: 18, price: 18900 },
      ],
      matchTitle: 'Масса, кг',
      matchValues: [18, 52, 44],
      answers: ['321', '16.8', '4100', '21930', '130'],
      questions: [
        'Найдите объём парной. Ответ дайте в кубических метрах.',
        'На сколько рублей самая недорогая подходящая дровяная модель дешевле подходящей электрической с учётом стоимости кабеля?',
        'На дровяную модель массой $52$ кг действует скидка 15 процентов. Сколько рублей нужно заплатить за эту печь со скидкой?',
      ],
      drawing: 'stoves-2.svg',
      drawingHeight: 293,
    },
    {
      room: ['3', '2,4', '2,2'],
      cableCost: '5900',
      models: [
        { number: 1, type: 'дровяная', volume: '10–16', mass: 42, price: 20700 },
        { number: 2, type: 'дровяная', volume: '14–20', mass: 50, price: 24600 },
        { number: 3, type: 'электрическая', volume: '12–18', mass: 17, price: 17800 },
      ],
      matchTitle: 'Цена, руб.',
      matchValues: [24600, 17800, 20700],
      answers: ['231', '7.2', '2900', '21648', '100'],
      questions: [
        'Вычислите площадь пола парной. Ответ дайте в квадратных метрах.',
        'На сколько рублей самая недорогая подходящая дровяная модель дороже подходящей электрической без учёта кабеля?',
        'На дровяную модель массой $50$ кг действует скидка 12 процентов. Найдите её стоимость после скидки.',
      ],
      drawing: 'stoves-3.svg',
      drawingHeight: 252,
    },
  ];

  function formatPrice(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '&nbsp;');
  }

  function condition(spec) {
    const [length, width, height] = spec.room;
    const rows = spec.models.map((model) => `<tr>
      <td>$${model.number}$</td><td>${model.type}</td><td>${model.volume}</td>
      <td>$${model.mass}$</td><td>${formatPrice(model.price)}</td>
    </tr>`).join('');
    return `В бане оборудуют прямоугольную парную длиной $${length}$ м, шириной $${width}$ м и высотой $${height}$ м. Для неё выбирают одну из трёх моделей печей.
      <div class="center"><div class="table-wrapper"><table class="latex-table">
        <tr><th>Номер модели</th><th>Тип</th><th>Рекомендуемый объём, куб. м</th><th>Масса, кг</th><th>Цена, руб.</th></tr>
        ${rows}
      </table></div></div>
      Дровяную печь устанавливают без дополнительных расходов. Для электрической модели нужен отдельный кабель стоимостью ${formatPrice(spec.cableCost)} руб.`;
  }

  function matchingQuestion(spec) {
    const values = spec.matchValues.map((value) => `<th>${formatPrice(value)}</th>`).join('');
    const cells = spec.matchValues.map(() => '<td></td>').join('');
    return `Сопоставьте указанные значения с моделями из основной таблицы. Запишите три номера подряд в заданном порядке.
      <div class="center"><div class="table-wrapper"><table class="latex-table">
        <tr><th>${spec.matchTitle}</th>${values}</tr>
        <tr><td>Номер модели</td>${cells}</tr>
      </table></div></div>`;
  }

  function drawingQuestion(spec) {
    const drawingPath = `/drawings/FIPI_OGE_MATH/real_math/${spec.drawing}`;
    return `<div class="table-wrapper"><table class="latex-table table-with-image">
      <tr>
        <th><img src="${imagePath}" width="155" height="242" alt="Печь с защитным кожухом"></th>
        <th><img src="${drawingPath}" width="303" height="${spec.drawingHeight}" alt="Размеры арочного кожуха"></th>
      </tr>
      <tr><td>Общий вид</td><td>Размеры кожуха</td></tr>
    </table></div>
    Верх кожуха образован дугой окружности с центром в середине его нижней стороны. Используя размеры на рисунке, найдите диаметр этой окружности. Ответ дайте в сантиметрах.`;
  }

  function makeAnalog(spec, index) {
    const prompts = [matchingQuestion(spec), ...spec.questions, drawingQuestion(spec)];
    const questions = prompts.map((html, questionIndex) => ({
      number: questionIndex + 1,
      html,
      answer: spec.answers[questionIndex],
      format: 'number',
    }));
    return {
      id: `stoves-5.1.${index + 1}`,
      label: `5.1.${index + 1}`,
      taskHtml: condition(spec),
      imagePath,
      answers: Object.fromEntries(spec.answers.map((answer, answerIndex) => [String(answerIndex + 1), answer])),
      questions,
    };
  }

  return [{
    id: 'stoves-5.1',
    number: '5.1',
    title: 'Печки',
    analogs: specs.map(makeAnalog),
  }];
});
