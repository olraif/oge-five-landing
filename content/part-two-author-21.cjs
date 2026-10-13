const assert = require('node:assert/strict');

const groups = [];
const near = (a, b) => Math.abs(a - b) < 1e-9;
const add = (number, page, cases, make) => {
  assert.equal(cases.length, 3);
  groups.push({
    prototypeId: `21.${number}`,
    examNumber: 21,
    sourcePage: page,
    analogs: cases.map((parameters, index) => ({
      id: `21.${number}-${'abc'[index]}`,
      ...make(parameters),
    })),
  });
};

add(1, 109, [
  { slow: 15, difference: 5, hours: 1 },
  { slow: 12, difference: 6, hours: 2 },
  { slow: 10, difference: 5, hours: 3 },
], ({ slow, difference, hours }) => {
  const distance = hours * slow * (slow + difference) / difference;
  assert(Number.isInteger(distance));
  return {
    prompt: `Два велосипедиста одновременно стартовали на маршруте длиной ${distance} км. Один едет на ${difference} км/ч быстрее другого и финиширует на ${hours} ч раньше. Найдите скорость более медленного велосипедиста.`,
    answer: `${slow} км/ч`,
    solution: `Если меньшая скорость равна v, то ${distance}/v − ${distance}/(v + ${difference}) = ${hours}. Положительный корень уравнения — v = ${slow} км/ч.`,
    validationMode: 'number_with_unit',
  };
});

add(2, 109, [
  { slow: 40, difference: 20, hours: 2 },
  { slow: 45, difference: 15, hours: 2 },
  { slow: 50, difference: 25, hours: 1 },
], ({ slow, difference, hours }) => {
  const fast = slow + difference;
  const distance = hours * slow * fast / difference;
  assert(Number.isInteger(distance));
  return {
    prompt: `Две машины одновременно выехали на маршрут длиной ${distance} км. Первая прибыла на ${hours} ч раньше, потому что ехала на ${difference} км/ч быстрее второй. Найдите скорость первой машины.`,
    answer: `${fast} км/ч`,
    solution: `Пусть скорость второй машины v. Тогда ${distance}/v − ${distance}/(v + ${difference}) = ${hours}; положительное решение v = ${slow}. Значит, первая ехала со скоростью ${fast} км/ч.`,
    validationMode: 'number_with_unit',
  };
});

add(3, 109, [
  { train: 72, walker: 4, seconds: 18 },
  { train: 90, walker: 6, seconds: 12 },
  { train: 66, walker: 3, seconds: 24 },
], ({ train, walker, seconds }) => {
  const length = (train - walker) * seconds / 3.6;
  assert(Number.isInteger(length));
  return {
    prompt: `Поезд движется со скоростью ${train} км/ч и полностью проходит мимо идущего в том же направлении пешехода за ${seconds} с. Скорость пешехода ${walker} км/ч. Найдите длину поезда.`,
    answer: `${length} м`,
    solution: `Относительная скорость составляет ${train - walker} км/ч = ${(train - walker) / 3.6} м/с. За ${seconds} с поезд проходит относительно пешехода собственную длину: ${length} м.`,
    validationMode: 'number_with_unit',
  };
});

add(4, 109, [
  { train: 54, walker: 6, seconds: 24 },
  { train: 72, walker: 3, seconds: 12 },
  { train: 63, walker: 9, seconds: 18 },
], ({ train, walker, seconds }) => {
  const length = (train + walker) * seconds / 3.6;
  assert(Number.isInteger(length));
  return {
    prompt: `Поезд со скоростью ${train} км/ч встречает пешехода, идущего параллельно путям навстречу ему со скоростью ${walker} км/ч. Мимо пешехода поезд проходит за ${seconds} с. Найдите длину поезда.`,
    answer: `${length} м`,
    solution: `При встречном движении скорости складываются: ${train + walker} км/ч. Умножив относительную скорость в м/с на ${seconds} с, получаем ${length} м.`,
    validationMode: 'number_with_unit',
  };
});

add(5, 110, [
  { speeds: [50, 70, 90], hours: 2 },
  { speeds: [60, 90, 120], hours: 2 },
  { speeds: [45, 60, 75], hours: 2 },
], ({ speeds, hours }) => {
  const distances = speeds.map((speed) => speed * hours);
  const total = distances.reduce((sum, value) => sum + value, 0);
  const average = total / (3 * hours);
  return {
    prompt: `Автомобиль проехал последовательно ${distances[0]}, ${distances[1]} и ${distances[2]} км со скоростями ${speeds[0]}, ${speeds[1]} и ${speeds[2]} км/ч соответственно. Найдите среднюю скорость за весь путь.`,
    answer: `${average} км/ч`,
    solution: `Каждый участок занял ${hours} ч. Общий путь ${total} км, общее время ${3 * hours} ч, поэтому средняя скорость ${total}/${3 * hours} = ${average} км/ч.`,
    validationMode: 'number_with_unit',
  };
});

add(6, 110, [
  { first: 60, second: 90 },
  { first: 48, second: 80 },
  { first: 72, second: 120 },
], ({ first, second }) => {
  const average = 2 * first * second / (first + second);
  assert(Number.isInteger(average));
  return {
    prompt: `Первую половину расстояния автомобиль ехал со скоростью ${first} км/ч, вторую половину — ${second} км/ч. Какова средняя скорость на всём пути?`,
    answer: `${average} км/ч`,
    solution: `Половины пути равны, поэтому средняя скорость — гармоническое среднее: 2·${first}·${second}/(${first} + ${second}) = ${average} км/ч.`,
    validationMode: 'number_with_unit',
  };
});

add(7, 110, [
  { first: 48, halfSpeed: 40, extra: 12 },
  { first: 72, halfSpeed: 60, extra: 18 },
  { first: 36, halfSpeed: 30, extra: 9 },
], ({ first, halfSpeed, extra }) => {
  assert(near(2 / first, 1 / halfSpeed + 1 / (first + extra)));
  return {
    prompt: `Две машины одновременно проехали один маршрут. Первая держала постоянную скорость. Вторая прошла первую половину пути со скоростью ${halfSpeed} км/ч, а вторую — на ${extra} км/ч быстрее первой машины. Они финишировали одновременно. Найдите скорость первой машины.`,
    answer: `${first} км/ч`,
    solution: `Если скорость первой равна v, то для двух равных половин пути 2/v = 1/${halfSpeed} + 1/(v + ${extra}). Положительный корень уравнения v = ${first} км/ч.`,
    validationMode: 'number_with_unit',
  };
});

add(8, 110, [
  { first: 72, less: 12, secondHalf: 90, threshold: 50 },
  { first: 60, less: 10, secondHalf: 75, threshold: 50 },
  { first: 96, less: 16, secondHalf: 120, threshold: 80 },
], ({ first, less, secondHalf, threshold }) => {
  assert(near(2 / first, 1 / (first - less) + 1 / secondHalf));
  const otherRoot = 2 * less * secondHalf / first;
  assert(otherRoot < threshold && first > threshold);
  return {
    prompt: `Две машины выехали одновременно из одного города и прибыли в другой вместе. Первая весь путь ехала с постоянной скоростью, большей ${threshold} км/ч. Вторая первую половину пути ехала на ${less} км/ч медленнее первой, а вторую — со скоростью ${secondHalf} км/ч. Найдите скорость первой машины.`,
    answer: `${first} км/ч`,
    solution: `При скорости первой v равенство времени даёт 2/v = 1/(v − ${less}) + 1/${secondHalf}. Корни полученного квадратного уравнения: ${otherRoot} и ${first}; условию v > ${threshold} отвечает только ${first} км/ч.`,
    validationMode: 'number_with_unit',
  };
});

add(9, 111, [
  { first: 12, second: 18, stopMinutes: 30, meetHours: 4 },
  { first: 15, second: 25, stopMinutes: 24, meetHours: 5 },
  { first: 10, second: 30, stopMinutes: 30, meetHours: 6 },
], ({ first, second, stopMinutes, meetHours }) => {
  const stopHours = stopMinutes / 60;
  const distance = (first + second) * meetHours - first * stopHours;
  const fromSecond = second * meetHours;
  assert(Number.isInteger(distance) && Number.isInteger(fromSecond));
  return {
    prompt: `Из двух городов навстречу друг другу выехали два велосипедиста со скоростями ${first} и ${second} км/ч. Первый по пути остановился на ${stopMinutes} мин, второй не останавливался. Расстояние между городами ${distance} км. Найдите расстояние от второго города до места встречи.`,
    answer: `${fromSecond} км`,
    solution: `Пусть встреча произошла через t часов. Тогда ${first}(t − ${stopMinutes}/60) + ${second}t = ${distance}, откуда t = ${meetHours}. Второй проехал ${second}·${meetHours} = ${fromSecond} км.`,
    validationMode: 'number_with_unit',
  };
});

add(10, 111, [
  { outward: 12, increase: 6, stopHours: 2 },
  { outward: 15, increase: 5, stopHours: 2 },
  { outward: 16, increase: 8, stopHours: 3 },
], ({ outward, increase, stopHours }) => {
  const returnSpeed = outward + increase;
  const distance = stopHours * outward * returnSpeed / increase;
  assert(Number.isInteger(distance));
  return {
    prompt: `Велосипедист проехал из посёлка в город ${distance} км. На обратном пути он увеличил скорость на ${increase} км/ч, но сделал остановку на ${stopHours} ч. Общее время возвращения получилось таким же, как время поездки туда. Найдите скорость на обратном пути.`,
    answer: `${returnSpeed} км/ч`,
    solution: `Если исходная скорость v, то ${distance}/v = ${distance}/(v + ${increase}) + ${stopHours}. Положительное решение v = ${outward}; обратная скорость ${returnSpeed} км/ч.`,
    validationMode: 'number_with_unit',
  };
});

add(11, 111, [
  { difference: 12, remaining: 3, minutesAgo: 15, first: 24 },
  { difference: 10, remaining: 2, minutesAgo: 12, first: 30 },
  { difference: 9, remaining: 3, minutesAgo: 20, first: 9 },
], ({ difference, remaining, minutesAgo, first }) => {
  const lap = first + remaining;
  assert(near(lap, (first + difference) * (1 - minutesAgo / 60)));
  return {
    prompt: `Два бегуна одновременно стартовали на круговой дорожке. Через час первому оставалось ${remaining} км до конца первого круга; второй завершил этот круг ${minutesAgo} мин назад. Скорость первого на ${difference} км/ч меньше скорости второго. Найдите скорость первого.`,
    answer: `${first} км/ч`,
    solution: `Если скорость первого v, длина круга равна v + ${remaining}. Второй пробежал круг за 1 − ${minutesAgo}/60 ч со скоростью v + ${difference}. Равенство v + ${remaining} = (v + ${difference})(1 − ${minutesAgo}/60) даёт v = ${first}.`,
    validationMode: 'number_with_unit',
  };
});

add(12, 112, [
  { speed: 12, current: 2, difference: 1 },
  { speed: 20, current: 4, difference: 2 },
  { speed: 18, current: 3, difference: 2 },
], ({ speed, current, difference }) => {
  const distance = difference * (speed * speed - current * current) / (2 * current);
  assert(Number.isInteger(distance));
  return {
    prompt: `Лодка прошла ${distance} км против течения и столько же обратно. Обратный путь занял на ${difference} ч меньше. Скорость течения ${current} км/ч. Найдите скорость лодки в стоячей воде.`,
    answer: `${speed} км/ч`,
    solution: `При собственной скорости v имеем ${distance}/(v − ${current}) − ${distance}/(v + ${current}) = ${difference}, v > ${current}. Положительное допустимое решение — ${speed} км/ч.`,
    validationMode: 'number_with_unit',
  };
});

add(13, 112, [
  { speed: 15, current: 3, distance: 72, stopHours: 2 },
  { speed: 20, current: 5, distance: 75, stopHours: 3 },
  { speed: 12, current: 2, distance: 70, stopHours: 1 },
], ({ speed, current, distance, stopHours }) => {
  const travelHours = distance / (speed + current) + distance / (speed - current);
  const totalHours = travelHours + stopHours;
  assert(Number.isInteger(totalHours));
  return {
    prompt: `Катер прошёл ${distance} км по течению, после стоянки ${stopHours} ч вернулся обратно. Вся поездка заняла ${totalHours} ч. Собственная скорость катера ${speed} км/ч. Найдите скорость течения.`,
    answer: `${current} км/ч`,
    solution: `Если скорость течения c, то время движения ${distance}/(${speed} + c) + ${distance}/(${speed} − c) = ${travelHours} ч. При 0 < c < ${speed} получаем c = ${current} км/ч.`,
    validationMode: 'number_with_unit',
  };
});

add(14, 112, [
  { speed: 14, current: 2, distance: 96, stopHours: 2 },
  { speed: 18, current: 3, distance: 105, stopHours: 4 },
  { speed: 20, current: 4, distance: 96, stopHours: 3 },
], ({ speed, current, distance, stopHours }) => {
  const travelHours = distance / (speed + current) + distance / (speed - current);
  const totalHours = travelHours + stopHours;
  assert(Number.isInteger(totalHours));
  return {
    prompt: `Теплоход проплыл ${distance} км по течению и столько же против течения, сделав между рейсами остановку на ${stopHours} ч. Вся поездка заняла ${totalHours} ч. Течение имеет скорость ${current} км/ч. Найдите собственную скорость теплохода.`,
    answer: `${speed} км/ч`,
    solution: `Для собственной скорости v > ${current}: ${distance}/(v + ${current}) + ${distance}/(v − ${current}) = ${travelHours}. Единственный подходящий положительный корень — v = ${speed} км/ч.`,
    validationMode: 'number_with_unit',
  };
});

add(15, 112, [
  { speed: 10, current: 2, distance: 24, delayHours: 1 },
  { speed: 15, current: 3, distance: 72, delayHours: 2 },
  { speed: 12, current: 4, distance: 48, delayHours: 1 },
], ({ speed, current, distance, delayHours }) => {
  const boatHours = distance / (speed + current) + distance / (speed - current);
  const raftDistance = current * (delayHours + boatHours);
  assert(Number.isInteger(raftDistance) && raftDistance < distance);
  return {
    prompt: `Между пристанями ${distance} км. Сначала из первой пристани отплыл плот, а через ${delayHours} ч за ним вышла лодка. Лодка дошла до второй пристани и сразу вернулась к первой; к этому моменту плот прошёл ${raftDistance} км. Скорость течения ${current} км/ч. Найдите собственную скорость лодки.`,
    answer: `${speed} км/ч`,
    solution: `Плот находился в пути ${raftDistance}/${current} ч, значит лодка — ${raftDistance}/${current} − ${delayHours} = ${boatHours} ч. При скорости лодки v > ${current}: ${distance}/(v + ${current}) + ${distance}/(v − ${current}) = ${boatHours}; отсюда v = ${speed} км/ч.`,
    validationMode: 'number_with_unit',
  };
});

add(16, 113, [
  { speed: 12, current: 2, downstreamHours: 2, upstreamHours: 3 },
  { speed: 15, current: 3, downstreamHours: 2, upstreamHours: 4 },
  { speed: 20, current: 5, downstreamHours: 3, upstreamHours: 2 },
], ({ speed, current, downstreamHours, upstreamHours }) => {
  const down = (speed + current) * downstreamHours;
  const up = (speed - current) * upstreamHours;
  const total = downstreamHours + upstreamHours;
  return {
    prompt: `Баржа прошла по течению ${down} км, затем повернула и прошла против течения ${up} км. На всё движение ушло ${total} ч. Скорость течения ${current} км/ч. Найдите собственную скорость баржи.`,
    answer: `${speed} км/ч`,
    solution: `Если собственная скорость v, то ${down}/(v + ${current}) + ${up}/(v − ${current}) = ${total}, v > ${current}. Подходящий положительный корень равен ${speed} км/ч.`,
    validationMode: 'number_with_unit',
  };
});

add(17, 113, [
  { freshKg: 200, freshWater: 80, driedWater: 20 },
  { freshKg: 360, freshWater: 75, driedWater: 25 },
  { freshKg: 300, freshWater: 84, driedWater: 20 },
], ({ freshKg, freshWater, driedWater }) => {
  const dryMatter = freshKg * (100 - freshWater) / 100;
  const driedKg = dryMatter * 100 / (100 - driedWater);
  assert(Number.isInteger(driedKg));
  return {
    prompt: `Свежие фрукты содержат ${freshWater}% воды, а высушенные — ${driedWater}%. Сколько килограммов высушенных фруктов получится из ${freshKg} кг свежих?`,
    answer: `${driedKg} кг`,
    solution: `Сухого вещества было ${freshKg}·${100 - freshWater}% = ${dryMatter} кг. После сушки оно составляет ${100 - driedWater}% массы, поэтому итоговая масса ${dryMatter}/0,${100 - driedWater} = ${driedKg} кг.`,
    validationMode: 'number_with_unit',
  };
});

add(18, 113, [
  { driedKg: 40, freshWater: 80, driedWater: 20 },
  { driedKg: 60, freshWater: 75, driedWater: 25 },
  { driedKg: 75, freshWater: 85, driedWater: 20 },
], ({ driedKg, freshWater, driedWater }) => {
  const dryMatter = driedKg * (100 - driedWater) / 100;
  const freshKg = dryMatter * 100 / (100 - freshWater);
  assert(Number.isInteger(freshKg));
  return {
    prompt: `После сушки получилось ${driedKg} кг фруктов с содержанием воды ${driedWater}%. Сколько килограммов свежих фруктов потребовалось, если до сушки они содержали ${freshWater}% воды?`,
    answer: `${freshKg} кг`,
    solution: `Сухого вещества в готовом продукте ${driedKg}·${100 - driedWater}% = ${dryMatter} кг. В свежих фруктах оно составляло ${100 - freshWater}% массы; исходная масса ${freshKg} кг.`,
    validationMode: 'number_with_unit',
  };
});

add(19, 113, [
  { firstKg: 10, secondKg: 20, firstPercent: 40, secondPercent: 70 },
  { firstKg: 12, secondKg: 18, firstPercent: 30, secondPercent: 80 },
  { firstKg: 6, secondKg: 18, firstPercent: 20, secondPercent: 60 },
], ({ firstKg, secondKg, firstPercent, secondPercent }) => {
  const combined = (firstKg * firstPercent + secondKg * secondPercent) / (firstKg + secondKg);
  const equalMass = (firstPercent + secondPercent) / 2;
  assert(Number.isInteger(combined) && Number.isInteger(equalMass));
  return {
    prompt: `Есть ${firstKg} кг первого раствора и ${secondKg} кг второго. Если смешать весь объём, концентрация станет ${combined}%. Если смешать равные массы этих же растворов, концентрация будет ${equalMass}%. Найдите концентрацию первого раствора.`,
    answer: `${firstPercent}%`,
    solution: `Пусть концентрации равны a% и b%. Тогда (a + b)/2 = ${equalMass}, а (${firstKg}a + ${secondKg}b)/${firstKg + secondKg} = ${combined}. Решение системы даёт a = ${firstPercent}%.`,
    validationMode: 'number_with_unit',
  };
});

add(20, 114, [
  { slower: 15, extra: 5, hours: 2 },
  { slower: 24, extra: 6, hours: 1 },
  { slower: 18, extra: 9, hours: 2 },
], ({ slower, extra, hours }) => {
  const faster = slower + extra;
  const order = hours * slower * faster / extra;
  assert(Number.isInteger(order));
  return {
    prompt: `Первый мастер изготавливает за час на ${extra} деталей больше второго и завершает заказ из ${order} деталей на ${hours} ч раньше. Сколько деталей за час делает первый мастер?`,
    answer: `${faster} деталей/ч`,
    solution: `При производительности второго v имеем ${order}/v − ${order}/(v + ${extra}) = ${hours}. Отсюда v = ${slower}, а первый изготавливает ${faster} деталей в час.`,
    validationMode: 'number_with_unit',
  };
});

add(21, 114, [
  { slower: 8, extra: 4, minutes: 5 },
  { slower: 10, extra: 5, minutes: 4 },
  { slower: 12, extra: 6, minutes: 3 },
], ({ slower, extra, minutes }) => {
  const faster = slower + extra;
  const volume = minutes * slower * faster / extra;
  assert(Number.isInteger(volume));
  return {
    prompt: `Вторая труба пропускает на ${extra} л/мин больше первой и заполняет резервуар объёмом ${volume} л на ${minutes} мин быстрее. Сколько литров в минуту пропускает вторая труба?`,
    answer: `${faster} л/мин`,
    solution: `Пусть первая пропускает v л/мин. Тогда ${volume}/v − ${volume}/(v + ${extra}) = ${minutes}. Положительное решение v = ${slower}; у второй трубы ${faster} л/мин.`,
    validationMode: 'number_with_unit',
  };
});

module.exports = groups;
