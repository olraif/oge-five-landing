const assert = require('node:assert/strict');

const groups = [];
const add = (number, page, cases, make) => {
  assert.equal(cases.length, 3);
  groups.push({
    prototypeId: `25.${number}`,
    examNumber: 25,
    sourcePage: page,
    analogs: cases.map((parameters, index) => ({
      id: `25.${number}-${'abc'[index]}`,
      ...make(parameters),
    })),
  });
};
const fraction = (numerator, denominator) => {
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const divisor = gcd(Math.abs(numerator), Math.abs(denominator));
  return denominator / divisor === 1 ? String(numerator / divisor) : `${numerator / divisor}/${denominator / divisor}`;
};

add(1, 127, [{ halfBase: 6, outer: 9 }, { halfBase: 8, outer: 12 }, { halfBase: 9, outer: 27 }], ({ halfBase, outer }) => ({
  prompt: `Основание равнобедренного треугольника равно ${2 * halfBase}. Вневписанная окружность, касающаяся основания в его середине и продолжений боковых сторон, имеет радиус ${outer}. Найдите радиус вписанной окружности.`,
  answer: fraction(halfBase * halfBase, outer),
  solution: `Обозначим половину основания a = ${halfBase}, высоту h и боковую сторону s. Радиусы вписанной и вневписанной окружностей равны r = ah/(s+a) и R = ah/(s−a). Так как s²−a²=h², имеем rR=a². Значит, r = ${halfBase ** 2}/${outer} = ${fraction(halfBase ** 2, outer)}.`,
  validationMode: 'number',
}));

add(2, 127, [{ bc: 10, angleB: 120, angleC: 120 }, { bc: 12, angleB: 105, angleC: 135 }, { bc: 7, angleB: 110, angleC: 130 }], ({ bc, angleB, angleC }) => {
  assert.equal(angleB + angleC, 240);
  return {
    prompt: `В выпуклом четырёхугольнике ABCD точка M — середина AD и равноудалена от всех четырёх вершин. Найдите AD, если BC = ${bc}, ∠B = ${angleB}° и ∠C = ${angleC}°.`,
    answer: String(2 * bc),
    solution: `Все вершины лежат на окружности с центром M, а AD — её диаметр. Поэтому ∠ABD = ∠ACD = 90°. Дуги AB и CD равны соответственно 2(${angleC}−90)° и 2(${angleB}−90)°. Дуга BC оставшейся полуокружности равна 60°, а хорда BC = AD·sin30° = AD/2. Следовательно, AD = ${2 * bc}.`,
    validationMode: 'number',
  };
});

add(3, 127, [{ side: 3, distance: 2 }, { side: 5, distance: 3 }, { side: 8, distance: 2 }], ({ side, distance }) => ({
  prompt: `Биссектрисы углов A и B параллелограмма ABCD пересекаются в K. Найдите площадь параллелограмма, если BC = ${side}, а расстояние от K до прямой AB равно ${distance}.`,
  answer: String(2 * side * distance),
  solution: `Поскольку K лежит на биссектрисе угла A, расстояния от K до AB и AD равны ${distance}. Из биссектрисы угла B расстояние от K до AB равно расстоянию до BC. Параллельные AD и BC разделены высотой 2·${distance}. Площадь равна BC·h = ${side}·${2 * distance} = ${2 * side * distance}.`,
  validationMode: 'number',
}));

add(4, 127, [{ midLegs: 18, midBases: 12, alpha: 35 }, { midLegs: 21, midBases: 9, alpha: 40 }, { midLegs: 25, midBases: 15, alpha: 30 }], ({ midLegs, midBases, alpha }) => ({
  prompt: `Углы при большем основании трапеции равны ${alpha}° и ${90 - alpha}°. Отрезок между серединами боковых сторон равен ${midLegs}, а между серединами оснований — ${midBases}. Найдите длины оснований.`,
  answer: `${midLegs - midBases}; ${midLegs + midBases}`,
  solution: `Средняя линия трапеции равна полусумме оснований: (a+b)/2 = ${midLegs}. Из суммы углов 90° следует, что высота является средним геометрическим горизонтальных проекций боковых сторон. Тогда отрезок между серединами оснований равен полуразности оснований: (a−b)/2 = ${midBases}. Поэтому основания ${midLegs + midBases} и ${midLegs - midBases}.`,
  validationMode: 'set_of_numbers',
}));

add(5, 128, [{ height: 10, md: 6 }, { height: 13, md: 5 }, { height: 15, md: 9 }], ({ height, md }) => ({
  prompt: `На стороне BC остроугольного треугольника ABC построена полуокружность как на диаметре. Она пересекает высоту AD в M; AD = ${height}, MD = ${md}. H — ортоцентр треугольника. Найдите AH.`,
  answer: fraction(height * height - md * md, height),
  solution: `Возьмём D за начало координат: B=(−u,0), C=(v,0), A=(0,${height}). Из уравнения окружности с диаметром BC получаем MD²=uv=${md ** 2}. Пересечение высоты AD с высотой из B имеет координату DH=uv/AD=${md ** 2}/${height}. Тогда AH=AD−DH=${fraction(height * height - md * md, height)}.`,
  validationMode: 'number',
}));

add(6, 128, [{ ad: 9, bc: 4, answer: 6 }, { ad: 16, bc: 9, answer: 12 }, { ad: 25, bc: 16, answer: 20 }], ({ ad, bc, answer }) => {
  assert.equal(ad * bc, answer * answer);
  return {
    prompt: `В прямоугольной трапеции ABCD сторона AB перпендикулярна основаниям AD и BC. Окружность проходит через C и D и касается прямой AB в E. Найдите расстояние от E до прямой CD, если AD = ${ad}, BC = ${bc}.`,
    answer: String(answer),
    solution: `Расположим B=(0,0), A=(0,h), C=(${bc},0), D=(${ad},h), E=(0,e). Подстановка C и D в уравнение окружности, касающейся x=0 в E, даёт тождество ((${bc})h + (${ad - bc})e)² = (${ad * bc})((${ad - bc})²+h²). Числитель формулы расстояния от E до CD — модуль (${bc})h + (${ad - bc})e, знаменатель √((${ad - bc})²+h²). Значит, расстояние равно √(AD·BC) = ${answer}.`,
    validationMode: 'number',
  };
});

add(7, 128, [2, 3, 4], (scale) => ({
  prompt: `В равнобедренную трапецию периметра ${200 * scale} и площади ${2000 * scale ** 2} вписана окружность. Найдите расстояние от пересечения диагоналей до меньшего основания.`,
  answer: String(8 * scale),
  solution: `Пусть основания a>b, высота h. Из касательности сумма оснований равна половине периметра: a+b=${100 * scale}. Из площади h=2S/(a+b)=${40 * scale}. Для равнобедренной трапеции с вписанной окружностью h²=ab; отсюда a=${80 * scale}, b=${20 * scale}. Диагонали делятся в отношении оснований, поэтому расстояние до меньшего основания равно hb/(a+b)=${8 * scale}.`,
  validationMode: 'number',
}));

add(8, 128, [{ p: 5, q: 4, sinN: 3, side: 12, radius: 10 }, { p: 13, q: 12, sinN: 5, side: 10, radius: 13 }, { p: 25, q: 24, sinN: 7, side: 14, radius: 25 }], ({ p, q, sinN, side, radius }) => ({
  prompt: `В треугольнике ABC биссектриса угла A делит высоту из B в отношении ${p}:${q}, считая от B. Найдите радиус описанной окружности, если BC = ${side}.`,
  answer: String(radius),
  solution: `Если ∠A=α, а биссектриса пересекает высоту в T, то BT:TH=1:cosα=${p}:${q}. Следовательно, cosα=${q}/${p}, sinα=${sinN}/${p}. По теореме синусов BC=2R sinα, поэтому R=${side}·${p}/(2·${sinN})=${radius}.`,
  validationMode: 'number',
}));

add(9, 128, [4, 8, 12], (length) => {
  const factor = length / 4;
  return {
    prompt: `В треугольнике ABC биссектриса BE и медиана AD перпендикулярны и обе имеют длину ${length}. Найдите AB, BC и AC.`,
    answer: `${factor}√13; ${2 * factor}√13; ${3 * factor}√5`,
    solution: `Пусть AB=c, BC=a, cos∠B=t. Перпендикулярность биссектрисы и медианы даёт a=2c. Равенство их длин приводит к 8(1+t)/9=2(1−t), то есть t=5/13. Тогда AD=4c/√13=${length}, откуда AB=${factor}√13, BC=${2 * factor}√13; по теореме косинусов AC=${3 * factor}√5.`,
    validationMode: 'set_of_numbers',
  };
});

add(10, 129, [3, 4, 5], (scale) => ({
  prompt: `Четырёхугольник ABCD вписан в окружность; AB = ${4 * scale}, CD = ${scale}. Диагонали AC и BD пересекаются в K под углом ∠AKB = 60°. Найдите радиус описанной окружности.`,
  answer: `${scale}√7`,
  solution: `Если половины центральных углов, соответствующих хордам AB и CD, равны α и β, то α+β=60° по теореме об угле между хордами. Из AB=2R sinα и CD=2R sinβ следует R=√(AB²+CD²+AB·CD)/√3. Подставляя ${4 * scale} и ${scale}, получаем R=${scale}√7.`,
  validationMode: 'number',
}));

add(11, 129, [{ cd: 13, bc: 4, ab: 12, area: 78 }, { cd: 25, bc: 9, ab: 24, area: 300 }, { cd: 20, bc: 4, ab: 16, area: 160 }], ({ cd, bc, ab, area }) => {
  const horizontal = cd - 2 * bc;
  const x = (cd * cd - ab * ab + horizontal * horizontal) / (2 * horizontal);
  const height = Math.sqrt(cd * cd - x * x);
  assert.equal(cd * height / 2, area);
  return {
    prompt: `В трапеции ABCD боковые стороны AB = ${ab}, CD = ${cd}, меньшее основание BC = ${bc}. Биссектриса ∠ADC проходит через середину AB. Найдите площадь трапеции.`,
    answer: String(area),
    solution: `Пусть AD=a, высота h. Из условия о биссектрисе через середину AB следует a+BC=CD, значит a=${cd - bc}. Если D=(0,0), C=(x,h), то CD²=x²+h² и AB²=(${horizontal}−x)²+h². Вычитание даёт x=${x}, затем h=${height}. Площадь (AD+BC)h/2=${area}.`,
    validationMode: 'number',
  };
});

add(12, 129, [{ m: 1, n: 4, cosN: 3, sinN: 4, hyp: 5, answer: '13/8' }, { m: 4, n: 9, cosN: 4, sinN: 3, hyp: 5, answer: '17/6' }, { m: 9, n: 16, cosN: 5, sinN: 12, hyp: 13, answer: '205/24' }], ({ m, n, cosN, sinN, hyp, answer }) => ({
  prompt: `На стороне AC треугольника ABC отмечены M и N так, что AM=${m}, AN=${n}. Найдите радиус окружности через M и N, касающейся луча AB, если cos∠BAC=${cosN}/${hyp}.`,
  answer,
  solution: `Пусть T — точка касания. По теореме о касательной AT²=AM·AN=${m * n}, так что AT=√${m * n}. Центр окружности проектируется на AC в середину MN, на расстоянии (${m}+${n})/2 от A. При sin∠A=${sinN}/${hyp} радиус R=((AM+AN)/2−AT·cos∠A)/sin∠A = ${answer}.`,
  validationMode: 'number',
}));

add(13, 129, [{ small: 3, big: 6, answer: 8 }, { small: 4, big: 12, answer: 12 }, { small: 6, big: 18, answer: 18 }], ({ small, big, answer }) => ({
  prompt: `Две окружности радиусов ${small} и ${big} касаются внешним образом. Отрезки AC и BD — их общие внешние касательные (A,B на первой, C,D на второй). Найдите расстояние между прямыми AB и CD.`,
  answer: String(answer),
  solution: `Расстояние между центрами L=${small + big}. Проекция нормали к общей касательной на линию центров равна (R−r)/L. Поэтому расстояние между хордами касания AB и CD равно L−(R−r)²/L=4Rr/(R+r)=4·${small}·${big}/${small + big}=${answer}.`,
  validationMode: 'number',
}));

add(14, 130, [{ ab: 12, ac: 18, cd: 10 }, { ab: 18, ac: 27, cd: 15 }, { ab: 20, ac: 25, cd: 9 }], ({ ab, ac, cd }) => {
  assert.equal((ac * ac - ab * ab) / ac, cd);
  return {
    prompt: `В треугольнике ABC стороны AB=${ab}, AC=${ac}; O — центр описанной окружности. Прямая через B, перпендикулярная AO, пересекает AC в D. Найдите CD.`,
    answer: String(cd),
    solution: `Положим A=(0,0), C=(${ac},0), B=(u,v), D=(d,0). Тогда абсцисса O равна ${ac}/2, а из OA=OB получаем 2v·O_y=AB²−${ac}u. Условие BD ⟂ AO даёт ${ac}(d−u)=AB²−${ac}u, то есть AD=d=AB²/AC=${ab * ab}/${ac}. Следовательно, CD=AC−AB²/AC=${cd}.`,
    validationMode: 'number',
  };
});

add(15, 130, [{ ad: 24, bc: 8, ab: 12, radius: 12 }, { ad: 30, bc: 10, ab: 15, radius: 15 }, { ad: 20, bc: 5, ab: 12, radius: 10 }], ({ ad, bc, ab, radius }) => {
  assert(ab < ad - bc);
  assert.equal(ab * (ad + bc) / (2 * (ad - bc)), radius);
  return {
    prompt: `В трапеции ABCD основания AD=${ad}, BC=${bc}; сумма углов при AD равна 90°. Найдите радиус окружности через A и B, касающейся прямой CD, если AB=${ab}.`,
    answer: String(radius),
    solution: `Из суммы углов при AD следует AB ⟂ CD. Пусть расстояния от A и B до прямой CD равны d_A и d_B. Поскольку хорда AB перпендикулярна касательной CD, её крайние точки находятся на расстояниях, сумма которых равна диаметру: 2R=d_A+d_B. Из подобия в трапеции d_A+d_B=AB·(AD+BC)/(AD−BC). Тогда R=${ab}·(${ad}+${bc})/[2·(${ad}−${bc})]=${radius}.`,
    validationMode: 'number',
  };
});

add(16, 130, [{ ao: 5, adDistance: 5, acDistance: 3, tangent: 4, area: 96 }, { ao: 13, adDistance: 8, acDistance: 5, tangent: 12, area: 520 }, { ao: 10, adDistance: 9, acDistance: 6, tangent: 8, area: 480 }], ({ ao, adDistance, acDistance, tangent, area }) => {
  assert.equal(ao * ao - acDistance * acDistance, tangent * tangent);
  assert.equal(2 * acDistance * tangent * (adDistance + acDistance) / (adDistance - acDistance), area);
  return {
    prompt: `В параллелограмме ABCD точка O — центр окружности, вписанной в треугольник ABC. Известно: OA=${ao}, расстояние от O до AD равно ${adDistance}, а до AC — ${acDistance}. Найдите площадь параллелограмма.`,
    answer: String(area),
    solution: `Радиус вписанной окружности треугольника ABC равен r=${acDistance}. Длина касательного отрезка из A равна √(OA²−r²)=${tangent}. Если BC=a, то полупериметр треугольника s=a+${tangent}, а расстояние между AD и BC равно ${adDistance}+r. Сравнивая площадь треугольника ABC как rs и как a(${adDistance}+r)/2, получаем a=2r·${tangent}/(${adDistance}−r). Площадь параллелограмма a(${adDistance}+r)=${area}.`,
    validationMode: 'number',
  };
});

module.exports = groups;
