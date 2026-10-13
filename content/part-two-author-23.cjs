const assert = require('node:assert/strict');

const groups = [];
const add = (number, page, cases, make) => {
  assert.equal(cases.length, 3);
  groups.push({
    prototypeId: `23.${number}`,
    examNumber: 23,
    sourcePage: page,
    analogs: cases.map((parameters, index) => ({
      id: `23.${number}-${'abc'[index]}`,
      ...make(parameters),
    })),
  });
};

add(1, 120, [
  { a: 12, b: 16, median: 10 },
  { a: 10, b: 24, median: 13 },
  { a: 16, b: 30, median: 17 },
], ({ a, b, median }) => {
  assert.equal(Math.hypot(a, b) / 2, median);
  return {
    prompt: `В прямоугольном треугольнике катеты равны ${a} и ${b} см. Найдите медиану, проведённую из вершины прямого угла к гипотенузе.`,
    answer: `${median} см`,
    solution: `По теореме Пифагора гипотенуза равна ${2 * median} см. Медиана из прямого угла составляет половину гипотенузы, то есть ${median} см.`,
    validationMode: 'number_with_unit',
  };
});

add(2, 120, [
  { a: 15, b: 20, c: 25, answer: '12' },
  { a: 5, b: 12, c: 13, answer: '60/13' },
  { a: 8, b: 15, c: 17, answer: '120/17' },
], ({ a, b, c, answer }) => {
  assert.equal(a * a + b * b, c * c);
  return {
    prompt: `Катеты прямоугольного треугольника равны ${a} и ${b} см. Найдите высоту к гипотенузе.`,
    answer: `${answer} см`,
    solution: `Площадь равна ab/2 и одновременно ch/2. Гипотенуза c = ${c}, поэтому h = ${a}·${b}/${c} = ${answer} см.`,
    validationMode: 'number_with_unit',
  };
});

add(3, 120, [
  { a: 5, b: 12, c: 13, answer: '60/13' },
  { a: 8, b: 15, c: 17, answer: '120/17' },
  { a: 15, b: 20, c: 25, answer: '12' },
], ({ a, b, c, answer }) => {
  assert.equal(a * a + b * b, c * c);
  return {
    prompt: `Один катет прямоугольного треугольника равен ${a} см, гипотенуза — ${c} см. Найдите высоту к гипотенузе.`,
    answer: `${answer} см`,
    solution: `Второй катет по теореме Пифагора равен ${b} см. Из равенства площадей h = ${a}·${b}/${c} = ${answer} см.`,
    validationMode: 'number_with_unit',
  };
});

add(4, 120, [
  { projection: 4, hypotenuse: 25, leg: 10 },
  { projection: 9, hypotenuse: 16, leg: 12 },
  { projection: 5, hypotenuse: 45, leg: 15 },
], ({ projection, hypotenuse, leg }) => {
  assert.equal(projection * hypotenuse, leg * leg);
  return {
    prompt: `Высота из вершины прямого угла делит гипотенузу. Проекция одного катета на гипотенузу равна ${projection} см, вся гипотенуза — ${hypotenuse} см. Найдите этот катет.`,
    answer: `${leg} см`,
    solution: `Квадрат катета равен произведению гипотенузы на его проекцию: a² = ${hypotenuse}·${projection} = ${leg * leg}. Значит, a = ${leg} см.`,
    validationMode: 'number_with_unit',
  };
});

add(5, 120, [
  { middle: 12, base: 36, remainder: 20, part: 10 },
  { middle: 15, base: 45, remainder: 18, part: 9 },
  { middle: 14, base: 35, remainder: 18, part: 12 },
], ({ middle, base, remainder, part }) => {
  assert.equal(part / (part + remainder), middle / base);
  return {
    prompt: `В треугольнике ABC отрезок MN параллелен AC, M лежит на AB, N — на BC. Если MN = ${middle} см, AC = ${base} см, NC = ${remainder} см, найдите BN.`,
    answer: `${part} см`,
    solution: `Из подобия треугольников BMN и BAC: BN/(BN + ${remainder}) = ${middle}/${base}. Решив это уравнение, получаем BN = ${part} см.`,
    validationMode: 'number_with_unit',
  };
});

add(6, 121, [
  { angleB: 40, angleC: 50, radius: 12, answer: '24' },
  { angleB: 50, angleC: 70, radius: 8, answer: '8√3' },
  { angleB: 80, angleC: 70, radius: 15, answer: '15' },
], ({ angleB, angleC, radius, answer }) => {
  const angleA = 180 - angleB - angleC;
  assert([30, 60, 90].includes(angleA));
  return {
    prompt: `В треугольнике ABC углы B и C равны ${angleB}° и ${angleC}°. Радиус описанной окружности равен ${radius} см. Найдите BC.`,
    answer: `${answer} см`,
    solution: `Угол A = 180° − ${angleB}° − ${angleC}° = ${angleA}°. По теореме синусов BC = 2R sin A = 2·${radius}·sin ${angleA}° = ${answer} см.`,
    validationMode: 'number_with_unit',
  };
});

add(7, 121, [
  { bk: 5, ck: 9 },
  { bk: 8, ck: 11 },
  { bk: 12, ck: 7 },
], ({ bk, ck }) => {
  const perimeter = 4 * bk + 2 * ck;
  return {
    prompt: `Биссектриса угла A параллелограмма ABCD пересекает BC в точке K. Если BK = ${bk} см и KC = ${ck} см, найдите периметр параллелограмма.`,
    answer: `${perimeter} см`,
    solution: `Так как AD ∥ BC, треугольник ABK равнобедренный и AB = BK = ${bk} см. BC = ${bk} + ${ck} = ${bk + ck} см. Периметр равен 2(AB + BC) = ${perimeter} см.`,
    validationMode: 'number_with_unit',
  };
});

add(8, 121, [
  { dh: 7, ch: 18, height: 24 },
  { dh: 8, ch: 9, height: 15 },
  { dh: 5, ch: 8, height: 12 },
], ({ dh, ch, height }) => {
  const side = dh + ch;
  assert.equal(side * side - dh * dh, height * height);
  return {
    prompt: `Высота AH ромба ABCD опущена на сторону CD и делит её на DH = ${dh} см и HC = ${ch} см. Найдите высоту ромба.`,
    answer: `${height} см`,
    solution: `Сторона ромба AD = CD = ${side} см. В прямоугольном треугольнике ADH высота AH = √(${side}² − ${dh}²) = ${height} см.`,
    validationMode: 'number_with_unit',
  };
});

add(9, 121, [
  { diagonal: '40', distance: '10', angles: '60; 120', note: 'Расстояние равно четверти данной диагонали, поэтому половина острого угла равна 30°.' },
  { diagonal: '20√2', distance: '10', angles: '90; 90', note: 'Для такой диагонали и расстояния получается квадрат: диагонали равны, углы прямые.' },
  { diagonal: '64', distance: '16', angles: '60; 120', note: 'Расстояние равно четверти данной диагонали, поэтому острый угол равен 60°.' },
], ({ diagonal, distance, angles, note }) => ({
  prompt: `Одна диагональ ромба равна ${diagonal} см. Расстояние от точки пересечения диагоналей до стороны равно ${distance} см. Найдите углы ромба в градусах.`,
  answer: angles,
  solution: `Удвоенное расстояние от центра до стороны равно высоте ромба. Используя прямоугольные треугольники с половинами диагоналей, получаем: ${note} Углы ромба: ${angles}°.` ,
  validationMode: 'set_of_numbers',
}));

add(10, 121, [
  { af: 5, bf: 12, side: 13 },
  { af: 8, bf: 15, side: 17 },
  { af: 7, bf: 24, side: 25 },
], ({ af, bf, side }) => {
  assert.equal(af * af + bf * bf, side * side);
  return {
    prompt: `В трапеции биссектрисы углов при одной боковой стороне AB пересекаются в точке F. Если AF = ${af} см и BF = ${bf} см, найдите AB.`,
    answer: `${side} см`,
    solution: `Углы при боковой стороне трапеции дополняют друг друга до 180°, поэтому их биссектрисы перпендикулярны. Треугольник AFB прямоугольный, AB = √(${af}² + ${bf}²) = ${side} см.`,
    validationMode: 'number_with_unit',
  };
});

add(11, 122, [
  { ab: 10, dc: 30, ac: 40, mc: 30 },
  { ab: 12, dc: 18, ac: 50, mc: 30 },
  { ab: 14, dc: 21, ac: 35, mc: 21 },
], ({ ab, dc, ac, mc }) => {
  assert.equal(ac * dc / (ab + dc), mc);
  return {
    prompt: `Параллельные отрезки AB и DC имеют длины ${ab} и ${dc} см. Отрезки AC и BD пересекаются в M; AC = ${ac} см. Найдите MC.`,
    answer: `${mc} см`,
    solution: `Из подобия треугольников AMB и CMD следует AM:MC = AB:DC = ${ab}:${dc}. Так как AC = AM + MC = ${ac}, имеем MC = ${ac}·${dc}/(${ab} + ${dc}) = ${mc} см.`,
    validationMode: 'number_with_unit',
  };
});

add(12, 122, [
  { angleB: 30, angleC: 120, cd: 8, ab: '8√3' },
  { angleB: 45, angleC: 120, cd: 10, ab: '5√6' },
  { angleB: 60, angleC: 135, cd: 12, ab: '4√6' },
], ({ angleB, angleC, cd, ab }) => ({
  prompt: `В трапеции ABCD основания AD и BC параллельны. Углы ABC и BCD равны ${angleB}° и ${angleC}°, а боковая сторона CD = ${cd} см. Найдите другую боковую сторону AB.`,
  answer: `${ab} см`,
  solution: `Высота трапеции выражается двумя способами: AB·sin ${angleB}° = CD·sin ${angleC}°. Значит, AB = ${cd}·sin ${angleC}°/sin ${angleB}° = ${ab} см.`,
  validationMode: 'number_with_unit',
}));

add(13, 122, [
  { bottom: 40, top: 10, p: 1, q: 2, middle: 20 },
  { bottom: 50, top: 20, p: 2, q: 3, middle: 32 },
  { bottom: 36, top: 12, p: 3, q: 1, middle: 30 },
], ({ bottom, top, p, q, middle }) => {
  assert.equal(top + (bottom - top) * p / (p + q), middle);
  return {
    prompt: `В трапеции основания равны ${bottom} и ${top} см. Отрезок EF параллелен основаниям и пересекает боковую сторону CD в F так, что CF:FD = ${p}:${q}. Найдите EF.`,
    answer: `${middle} см`,
    solution: `От верхнего основания к нижнему пройдено ${p}/${p + q} боковой стороны. Длина параллельного отрезка меняется линейно: EF = ${top} + (${bottom} − ${top})·${p}/${p + q} = ${middle} см.`,
    validationMode: 'number_with_unit',
  };
});

add(14, 122, [
  { ak: 18, ratio: '1,5', kp: 12 },
  { ak: 20, ratio: '2', kp: 10 },
  { ak: 25, ratio: '1,25', kp: 20 },
], ({ ak, ratio, kp }) => ({
  prompt: `Окружность проходит через B и C треугольника ABC и пересекает AB и AC ещё в точках K и P. Известно, что AK = ${ak} см, а AC в ${ratio} раза длиннее BC. Найдите KP.`,
  answer: `${kp} см`,
  solution: `Треугольники AKP и ACB подобны, поэтому KP/BC = AK/AC. Значит, KP = AK·BC/AC = ${ak}/${ratio} = ${kp} см.`,
  validationMode: 'number_with_unit',
}));

add(15, 122, [
  { ab: 3, radius: 4, ao: 5, ac: 9 },
  { ab: 5, radius: 12, ao: 13, ac: 25 },
  { ab: 8, radius: 15, ao: 17, ac: 32 },
], ({ ab, radius, ao, ac }) => {
  assert.equal(ab * ab + radius * radius, ao * ao);
  assert.equal(ao + radius, ac);
  return {
    prompt: `Окружность с центром O на стороне AC треугольника ABC проходит через C и касается прямой AB в точке B. Если AB = ${ab} см, а диаметр окружности равен ${2 * radius} см, найдите AC.`,
    answer: `${ac} см`,
    solution: `OB = OC = ${radius} см и OB ⟂ AB. В прямоугольном треугольнике AOB: AO = √(${ab}² + ${radius}²) = ${ao} см. Поэтому AC = AO + OC = ${ao} + ${radius} = ${ac} см.`,
    validationMode: 'number_with_unit',
  };
});

add(16, 123, [
  { ab: 3, ac: 9, diameter: 8 },
  { ab: 5, ac: 25, diameter: 24 },
  { ab: 8, ac: 32, diameter: 30 },
], ({ ab, ac, diameter }) => {
  assert.equal((ac * ac - ab * ab) / ac, diameter);
  return {
    prompt: `Окружность с центром O на стороне AC треугольника ABC проходит через C и касается прямой AB в точке B. Если AB = ${ab} см и AC = ${ac} см, найдите диаметр окружности.`,
    answer: `${diameter} см`,
    solution: `Пусть радиус равен r. Тогда AO = AC − r и OB = r ⟂ AB. По теореме Пифагора ${ab}² + r² = (${ac} − r)², откуда 2r = (AC² − AB²)/AC = ${diameter} см.`,
    validationMode: 'number_with_unit',
  };
});

add(17, 123, [7, 11, 18], (height) => ({
  prompt: `В прямоугольном треугольнике ABC из вершины прямого угла B проведена высота BH = ${height} см к гипотенузе. Окружность с диаметром BH пересекает катеты BA и BC вторично в P и K. Найдите PK.`,
  answer: `${height} см`,
  solution: `Углы BPH и BKH прямые как вписанные углы, опирающиеся на диаметр BH. Так как BA ⟂ BC, четырёхугольник BPHK — прямоугольник. Его диагонали равны: PK = BH = ${height} см.`,
  validationMode: 'number_with_unit',
}));

add(18, 123, [
  { firstChord: 10, firstDistance: 12, secondChord: 24, secondDistance: 5 },
  { firstChord: 16, firstDistance: 15, secondChord: 30, secondDistance: 8 },
  { firstChord: 14, firstDistance: 24, secondChord: 48, secondDistance: 7 },
], ({ firstChord, firstDistance, secondChord, secondDistance }) => {
  assert.equal((firstChord / 2) ** 2 + firstDistance ** 2,
    (secondChord / 2) ** 2 + secondDistance ** 2);
  return {
    prompt: `Хорды AB и CD одной окружности равны ${firstChord} и ${secondChord} см. Расстояние от центра до AB равно ${firstDistance} см. Найдите расстояние от центра до CD.`,
    answer: `${secondDistance} см`,
    solution: `Квадрат радиуса равен (${firstChord}/2)² + ${firstDistance}². Для второй хорды d² = R² − (${secondChord}/2)² = ${secondDistance ** 2}; значит d = ${secondDistance} см.`,
    validationMode: 'number_with_unit',
  };
});

add(19, 123, [
  { firstChord: 10, firstDistance: 12, secondDistance: 5, secondChord: 24 },
  { firstChord: 16, firstDistance: 15, secondDistance: 8, secondChord: 30 },
  { firstChord: 14, firstDistance: 24, secondDistance: 15, secondChord: 40 },
], ({ firstChord, firstDistance, secondDistance, secondChord }) => {
  assert.equal((firstChord / 2) ** 2 + firstDistance ** 2,
    (secondChord / 2) ** 2 + secondDistance ** 2);
  return {
    prompt: `Хорда AB равна ${firstChord} см, расстояние от центра окружности до неё — ${firstDistance} см. Другая хорда CD находится на расстоянии ${secondDistance} см от центра. Найдите CD.`,
    answer: `${secondChord} см`,
    solution: `Радиус удовлетворяет R² = (${firstChord}/2)² + ${firstDistance}². Половина второй хорды равна √(R² − ${secondDistance}²) = ${secondChord / 2} см, поэтому CD = ${secondChord} см.`,
    validationMode: 'number_with_unit',
  };
});

module.exports = groups;
