(function initTiresData(root, factory) {
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  if (root) root.OgeTaskOneToFiveTires = data;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createTiresData() {
  const IMAGE_PATH = '/drawings/FIPI_OGE_MATH/real_math/tires-1.svg';
  const factorySizes = [
    [185, 65, 15], [195, 55, 16], [205, 60, 16], [215, 55, 17], [225, 50, 17],
    [235, 55, 18], [175, 70, 14], [185, 60, 15], [195, 65, 15], [205, 55, 16],
    [215, 60, 16], [225, 55, 17], [235, 50, 18], [245, 45, 19], [255, 55, 18],
    [265, 50, 19], [275, 45, 20], [195, 60, 16], [205, 50, 17], [225, 60, 18],
    [235, 65, 17],
  ];

  function diameter([width, profile, rim]) {
    return rim * 25.4 + 2 * width * profile / 100;
  }

  function formatNumber(value, digits) {
    const rounded = digits === undefined
      ? Math.round((value + Number.EPSILON) * 100) / 100
      : Math.round((value + Number.EPSILON) * (10 ** digits)) / (10 ** digits);
    return String(rounded).replace('.', ',');
  }

  function marking(size) {
    return `$${size[0]}/${size[1]}\\ R${size[2]}$`;
  }

  function replacementFor(factorySize, index) {
    const [width, profile, rim] = factorySize;
    return index % 2 === 0
      ? [width + 10, profile - 5, rim + 1]
      : [width - 10, profile + 5, rim - 1];
  }

  function percentReplacementFor(factorySize, index) {
    const [width, profile, rim] = factorySize;
    if (index % 3 === 0) return [width + 20, profile - 10, rim + 1];
    if (index % 3 === 1) return [width - 10, profile + 5, rim];
    return [width + 10, profile - 5, rim];
  }

  function tableData(factorySize, index) {
    const [width, profile, rim] = factorySize;
    const rims = [rim - 1, rim, rim + 1];
    const widths = [width - 10, width, width + 10, width + 20];
    const cells = [
      [profile + 5, profile, null],
      [profile + 5, profile, profile - 5],
      [profile, profile - 5, profile - 10],
      [null, profile - 10, profile - 15],
    ];
    const targetColumn = index % 2 === 0 ? 2 : 0;
    const direction = index % 2 === 0 ? 'наименьшей' : 'наибольшей';
    const allowedWidths = widths.filter((_, row) => cells[row][targetColumn] !== null);
    const answer = direction === 'наименьшей'
      ? Math.min(...allowedWidths)
      : Math.max(...allowedWidths);
    return { rims, widths, cells, targetColumn, direction, answer };
  }

  function tableHtml(table) {
    const rimHeaders = table.rims.map((rim) => `<td>$${rim}$</td>`).join('');
    const rows = table.widths.map((width, row) => {
      const values = table.cells[row].map((profile) => (
        profile === null ? '<td>&thinsp;&mdash;&nbsp;</td>' : `<td>$${width}/${profile}$</td>`
      )).join('');
      return `<tr><td>$${width}$</td>${values}</tr>`;
    }).join('');
    return `<div class="center"><div class="table-wrapper"><table class="latex-table">
      <tr><th></th><th colspan="3">Диаметр диска (дюймы)</th></tr>
      <tr><td>Ширина шины (мм)</td>${rimHeaders}</tr>
      ${rows}
    </table></div></div>`;
  }

  function taskCondition(factorySize) {
    return `<div class="table-wrapper"><table class="latex-table table-with-image">
      <tr>
        <th>В шинном центре сравнивают комплекты автомобильных колёс. Металлический диск находится внутри шины, поэтому диаметр внутреннего отверстия шины равен диаметру диска.</th>
        <th><div class="center"><img src="/drawings/FIPI_OGE_MATH/real_math/tires-1.svg" width="262" height="101" alt="Схема автомобильного колеса"><div class="center">Рис. 1</div></div></th>
      </tr>
    </table></div><br>
    <div class="table-wrapper"><table class="latex-table table-with-image">
      <tr>
        <th>Маркировка шины состоит из трёх основных чисел. В записи $205/60\\ R16$ число $205$ обозначает ширину шины $B$ в миллиметрах, а число $60$ показывает высоту боковины $H$ в процентах от ширины. Значит, для такой шины $H = 205 \\cdot 0,60 = 123$ мм. Число после буквы $R$ задаёт диаметр диска в дюймах.</th>
        <th><div class="center"><img src="/drawings/FIPI_OGE_MATH/real_math/tires-2.svg" width="262" height="197" alt="Размеры шины на схеме"><div class="center">Рис. 2</div></div></th>
      </tr>
    </table></div><br>
    При расчётах считайте, что один дюйм равен $25,4$ мм. Внешний диаметр колеса равен диаметру диска вместе с двумя боковинами шины.<br>
    На учебном автомобиле установлен штатный комплект шин с маркировкой <span>${marking(factorySize)}.</span>`;
  }

  function makeAnalog(factorySize, index) {
    const number = index + 1;
    const table = tableData(factorySize, index);
    const sidewallSize = [factorySize[0] + 20, factorySize[1] - 5, factorySize[2]];
    const replacement = replacementFor(factorySize, index);
    const percentReplacement = percentReplacementFor(factorySize, index);
    const factoryDiameter = diameter(factorySize);
    const replacementDiameter = diameter(replacement);
    const percentDiameter = diameter(percentReplacement);
    const diameterDirection = replacementDiameter > factoryDiameter ? 'увеличится' : 'уменьшится';
    const percentDirection = percentDiameter > factoryDiameter ? 'увеличится' : 'уменьшится';
    const answers = {
      1: String(table.answer),
      2: formatNumber(sidewallSize[0] * sidewallSize[1] / 100),
      3: formatNumber(factoryDiameter),
      4: formatNumber(Math.abs(replacementDiameter - factoryDiameter)),
      5: formatNumber(Math.abs(percentDiameter - factoryDiameter) / factoryDiameter * 100, 1),
    };
    const questions = [
      {
        number: 1,
        html: `Для учебного автомобиля разрешены размеры шин из таблицы. ${tableHtml(table)} Шины какой ${table.direction} ширины можно выбрать для диска диаметром $${table.rims[table.targetColumn]}$ дюймов? Ответ дайте в миллиметрах.`,
        answer: answers[1],
        format: 'decimal',
      },
      {
        number: 2,
        html: `Найдите высоту боковины шины с маркировкой <span>${marking(sidewallSize)}.</span> Ответ дайте в миллиметрах.`,
        answer: answers[2],
        format: 'decimal',
      },
      {
        number: 3,
        html: 'Вычислите внешний диаметр штатного колеса учебного автомобиля. Ответ дайте в миллиметрах.',
        answer: answers[3],
        format: 'decimal',
      },
      {
        number: 4,
        html: `На сколько миллиметров ${diameterDirection} внешний диаметр колеса, если вместо штатных шин установить шины <span>${marking(replacement)}?</span>`,
        answer: answers[4],
        format: 'decimal',
      },
      {
        number: 5,
        html: `На сколько процентов ${percentDirection} путь автомобиля за один оборот колеса, если вместо штатных шин установить шины <span>${marking(percentReplacement)}?</span> Ответ округлите до десятых.`,
        answer: answers[5],
        format: 'decimal',
      },
    ];
    return {
      id: `tires-2.1.${number}`,
      label: `2.1.${number}`,
      taskHtml: taskCondition(factorySize),
      imagePath: IMAGE_PATH,
      answers,
      questions,
    };
  }

  return [{
    id: 'tires-2.1',
    number: '2.1',
    title: 'Шины',
    analogs: factorySizes.map(makeAnalog),
  }];
});
