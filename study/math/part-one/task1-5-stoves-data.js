(function initStovesData(root, factory) {
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  if (root) root.OgeTaskOneToFiveStoves = data;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createStovesData() {
  return [
  {
    "id": "stoves-5.1",
    "number": "5.1",
    "title": "Печки",
    "analogs": [
      {
        "id": "stoves-5.1.1",
        "label": "5.1.1",
        "sourceId": "KQV9DIS",
        "sourceAnalog": 0,
        "taskHtml": "Хозяин дачного участка строит баню с парным отделением. Парное отделение имеет размеры: длина $3,5$ м, ширина $2,2$ м, высота $2$ м. Окон в парном отделении нет, для доступа внутрь планируется дверь шириной $60$ см, высота дверного проёма $1,8$ м. Для прогрева парного отделения можно использовать электрическую или дровяную печь. В таблице представлены характеристики трёх печей. <div class=\"center\"> <div class=\"table-wrapper\">\n<table class=\"latex-table\">\n<tr>\n<th><strong>Номер печи</strong></th>\n<th><strong>Тип</strong></th>\n<th><strong>Объём помещения, $\\text{м}^3$</strong></th>\n<th><strong>Масса, кг</strong></th>\n<th><strong>Стоимость, руб.</strong></th>\n</tr>\n<tr>\n<td>$1$</td>\n<td>дровяная</td>\n<td>$8$ – $12$</td>\n<td>$40$</td>\n<td>$18\\ 000$</td>\n</tr>\n<tr>\n<td>$2$</td>\n<td>дровяная</td>\n<td>$10$ – $16$</td>\n<td>$48$</td>\n<td>$19\\ 500$</td>\n</tr>\n<tr>\n<td>$3$</td>\n<td>электрическая</td>\n<td>$9$ – $15,5$</td>\n<td>$15$</td>\n<td>$15\\ 000$</td>\n</tr>\n</table>\n</div> </div> Для установки дровяной печи дополнительных затрат не потребуется. Установка электрической печи потребует подведения специального кабеля, что обойдётся в $6500$ руб.",
        "imagePath": "/drawings/FIPI_OGE_MATH/real_math/stoves-1.svg",
        "answers": {
          "1": "312",
          "2": "15.4",
          "3": "2000",
          "4": "16200",
          "5": "65"
        },
        "questions": [
          {
            "number": 1,
            "html": "Установите соответствие между массами и номерами печей. Заполните таблицу, в бланк ответов перенесите последовательность трёх цифр без пробелов, запятых и других дополнительных символов. <div class=\"center\"> <div class=\"table-wrapper\">\n<table class=\"latex-table\">\n<tr>\n<th><strong>Масса, кг</strong></th>\n<th>$15$</th>\n<th>$40$</th>\n<th>$48$</th>\n</tr>\n<tr>\n<td><strong>Номер печи</strong></td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n</table>\n</div> </div>",
            "answer": "312",
            "format": "number"
          },
          {
            "number": 2,
            "html": "Найдите объём парного отделения строящейся бани. Ответ дайте в кубических метрах.",
            "answer": "15.4",
            "format": "number"
          },
          {
            "number": 3,
            "html": "На сколько рублей покупка дровяной печи, подходящей по объёму парного отделения, обойдётся дешевле электрической с учётом установки?",
            "answer": "2000",
            "format": "number"
          },
          {
            "number": 4,
            "html": "На дровяную печь, масса которой $40$ кг, сделали скидку <span>$10\\%$.</span> Сколько рублей стала стоить печь?",
            "answer": "16200",
            "format": "number"
          },
          {
            "number": 5,
            "html": "<div class=\"table-wrapper\">\n<table class=\"latex-table table-with-image\">\n<tr>\n<th><img alt=\"Чертёж к задаче\" height=\"242\" src=\"/drawings/FIPI_OGE_MATH/real_math/stoves-1.svg\" width=\"155\"/></th>\n<th><img alt=\"Чертёж к задаче\" height=\"293\" src=\"/drawings/FIPI_OGE_MATH/real_math/stoves-2.svg\" width=\"303\"/></th>\n</tr>\n<tr>\n<td>Рис. 1</td>\n<td>Рис. 2</td>\n</tr>\n</table>\n</div>  Печь снабжена кожухом вокруг дверцы топки. Верхняя часть кожуха выполнена в виде арки, приваренной к передней стенке печки по дуге окружности с центром в середине нижней части кожуха (рис. 2). Для установки печки хозяину понадобилось узнать радиус закругления арки <span>$R$.</span> Размеры кожуха в сантиметрах показаны на рисунке. Найдите радиус закругления арки в сантиметрах.",
            "answer": "65",
            "format": "number"
          }
        ]
      },
      {
        "id": "stoves-5.1.2",
        "label": "5.1.2",
        "sourceId": "JRNT8GM",
        "sourceAnalog": 1,
        "taskHtml": "Хозяин дачного участка строит баню с парным отделением. Парное отделение имеет размеры: длина $3,5$ м, ширина $2,2$ м, высота $2$ м. Окон в парном отделении нет, для доступа внутрь планируется дверь шириной $60$ см, высота дверного проёма $1,8$ м. Для прогрева парного отделения можно использовать электрическую или дровяную печь. В таблице представлены характеристики трёх печей. <div class=\"center\"> <div class=\"table-wrapper\">\n<table class=\"latex-table\">\n  <tr>\n    <th><strong>Номер печи</strong></th>\n    <th><strong>Тип</strong></th>\n    <th><strong>Объём помещения, $\\text{м}^3$</strong></th>\n    <th><strong>Масса, кг</strong></th>\n    <th><strong>Стоимость, руб.</strong></th>\n  </tr>\n  <tr>\n    <td>$1$</td>\n    <td>дровяная</td>\n    <td>$8$ &ndash; $12$</td>\n    <td>$40$</td>\n    <td>$18\\ 000$</td>\n  </tr>\n  <tr>\n    <td>$2$</td>\n    <td>дровяная</td>\n    <td>$10$ &ndash; $16$</td>\n    <td>$48$</td>\n    <td>$19\\ 500$</td>\n  </tr>\n  <tr>\n    <td>$3$</td>\n    <td>электрическая</td>\n    <td>$9$ &ndash; $15,5$</td>\n    <td>$15$</td>\n    <td>$15\\ 000$</td>\n  </tr>\n</table>\n</div> </div> Для установки дровяной печи дополнительных затрат не потребуется. Установка электрической печи потребует подведения специального кабеля, что обойдётся в $6500$ руб.",
        "imagePath": "/drawings/FIPI_OGE_MATH/real_math/stoves-1.svg",
        "answers": {
          "1": "321",
          "2": "7.7",
          "3": "4500",
          "4": "17550",
          "5": "50"
        },
        "questions": [
          {
            "number": 1,
            "html": "Установите соответствие между стоимостями и номерами печей. Заполните таблицу, в бланк ответов перенесите последовательность трёх цифр без пробелов, запятых и других дополнительных символов. <div class=\"center\"> <div class=\"table-wrapper\">\n<table class=\"latex-table\">\n  <tr>\n    <th><strong>Стоимость, руб.</strong></th>\n    <th>$15\\ 000$</th>\n    <th>$19\\ 500$</th>\n    <th>$18\\ 000$</th>\n  </tr>\n  <tr>\n    <td><strong>Номер печи</strong></td>\n    <td></td>\n    <td></td>\n    <td></td>\n  </tr>\n</table>\n</div> </div>",
            "answer": "321",
            "format": "number"
          },
          {
            "number": 2,
            "html": "Найдите площадь пола парного отделения строящейся бани. Ответ дайте в квадратных метрах.",
            "answer": "7.7",
            "format": "number"
          },
          {
            "number": 3,
            "html": "На сколько рублей покупка дровяной печи, подходящей по объёму парного отделения, обойдётся дороже электрической без учёта установки?",
            "answer": "4500",
            "format": "number"
          },
          {
            "number": 4,
            "html": "На дровяную печь, масса которой $48$ кг, сделали скидку <span>$10\\%$.</span> Сколько рублей стала стоить печь?",
            "answer": "17550",
            "format": "number"
          },
          {
            "number": 5,
            "html": "<div class=\"table-wrapper\">\n<table class=\"latex-table table-with-image\">\n  <tr>\n    <th><img src=\"/drawings/FIPI_OGE_MATH/real_math/stoves-1.svg\" width=\"155\" height=\"242\" alt=\"Чертёж к задаче\"></th>\n    <th><img src=\"/drawings/FIPI_OGE_MATH/real_math/stoves-3.svg\" width=\"303\" height=\"252\" alt=\"Чертёж к задаче\"></th>\n  </tr>\n  <tr>\n    <td>Рис. 1</td>\n    <td>Рис. 2</td>\n  </tr>\n</table>\n</div>  Печь снабжена кожухом вокруг дверцы топки. Верхняя часть кожуха выполнена в виде арки, приваренной к передней стенке печки по дуге окружности с центром в середине нижней части кожуха (рис. 2). Для установки печки хозяину понадобилось узнать радиус закругления арки <span>$R$.</span> Размеры кожуха в сантиметрах показаны на рисунке. Найдите радиус закругления арки в сантиметрах.",
            "answer": "50",
            "format": "number"
          }
        ]
      }
    ]
  }
];
});
