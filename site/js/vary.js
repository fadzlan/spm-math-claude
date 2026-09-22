/* Shared bilingual context banks for the variety packs (js/data/x*.js).
 * Every entry has en + ms, so a question can swap its *story* without touching the maths. Use with r.pick(SPM.bank.foods).
 * Prices are a plausible RM range (lo–hi per unit) so that generators can draw a sensible price with r.int / r.step.
 */
(function (root) {
  'use strict';
  const SPM = root.SPM;
  const b = (en, ms, extra) => Object.assign({ en, ms }, extra);

  SPM.cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

  SPM.bank = {
    /* things sold in shops: en = plural, en1 = singular, ms works for both; price in RM per unit */
    items: [
      b('pens', 'pen', { en1: 'pen', lo: 1, hi: 4 }),
      b('exercise books', 'buku latihan', { en1: 'exercise book', lo: 2, hi: 6 }),
      b('rulers', 'pembaris', { en1: 'ruler', lo: 1, hi: 3 }),
      b('erasers', 'pemadam', { en1: 'eraser', lo: 1, hi: 2 }),
      b('school bags', 'beg sekolah', { en1: 'school bag', lo: 40, hi: 90 }),
      b('T-shirts', 'baju-T', { en1: 'T-shirt', lo: 15, hi: 45 }),
      b('caps', 'topi', { en1: 'cap', lo: 10, hi: 30 }),
      b('badminton rackets', 'raket badminton', { en1: 'badminton racket', lo: 30, hi: 120 }),
      b('footballs', 'bola sepak', { en1: 'football', lo: 25, hi: 80 }),
      b('calculators', 'kalkulator', { en1: 'calculator', lo: 20, hi: 60 }),
      b('umbrellas', 'payung', { en1: 'umbrella', lo: 10, hi: 25 }),
      b('batik scarves', 'selendang batik', { en1: 'batik scarf', lo: 20, hi: 60 }),
      b('flash drives', 'pemacu kilat', { en1: 'flash drive', lo: 15, hi: 40 }),
      b('water bottles', 'botol air', { en1: 'water bottle', lo: 8, hi: 25 }),
    ],
    /* dishes and drinks sold at a stall / canteen; price in RM each */
    foods: [
      b('nasi lemak packets', 'bungkus nasi lemak', { en1: 'packet of nasi lemak', lo: 2, hi: 5 }),
      b('roti canai', 'roti canai', { en1: 'roti canai', lo: 1, hi: 3 }),
      b('cups of teh tarik', 'cawan teh tarik', { en1: 'cup of teh tarik', lo: 2, hi: 4 }),
      b('bowls of laksa', 'mangkuk laksa', { en1: 'bowl of laksa', lo: 5, hi: 9 }),
      b('satay sticks', 'cucuk sate', { en1: 'satay stick', lo: 1, hi: 2 }),
      b('curry puffs', 'karipap', { en1: 'curry puff', lo: 1, hi: 2 }),
      b('glasses of sirap bandung', 'gelas sirap bandung', { en1: 'glass of sirap bandung', lo: 2, hi: 4 }),
      b('plates of char kuey teow', 'pinggan char kuey teow', { en1: 'plate of char kuey teow', lo: 6, hi: 10 }),
      b('pieces of kuih', 'keping kuih', { en1: 'piece of kuih', lo: 1, hi: 2 }),
      b('boxes of cendol', 'kotak cendol', { en1: 'box of cendol', lo: 3, hi: 6 }),
    ],
    /* produce sold by mass; price in RM per kg */
    fruits: [
      b('durian', 'durian', { lo: 10, hi: 30 }),
      b('rambutan', 'rambutan', { lo: 5, hi: 12 }),
      b('mangoes', 'mangga', { lo: 4, hi: 12 }),
      b('bananas', 'pisang', { lo: 3, hi: 8 }),
      b('papaya', 'betik', { lo: 2, hi: 6 }),
      b('watermelon', 'tembikai', { lo: 2, hi: 5 }),
      b('mangosteen', 'manggis', { lo: 8, hi: 20 }),
      b('pineapples', 'nanas', { lo: 3, hi: 7 }),
      b('oranges', 'oren', { lo: 5, hi: 10 }),
      b('guavas', 'jambu batu', { lo: 4, hi: 9 }),
    ],
    /* places in Malaysia */
    places: [
      b('Kuala Lumpur', 'Kuala Lumpur'), b('Ipoh', 'Ipoh'), b('Johor Bahru', 'Johor Bahru'), b('Kuantan', 'Kuantan'),
      b('Kota Bharu', 'Kota Bharu'), b('Alor Setar', 'Alor Setar'), b('Melaka', 'Melaka'), b('Seremban', 'Seremban'),
      b('Kuching', 'Kuching'), b('Kota Kinabalu', 'Kota Kinabalu'), b('Penang', 'Pulau Pinang'), b('Kuala Terengganu', 'Kuala Terengganu'),
      b('Taiping', 'Taiping'), b('Shah Alam', 'Shah Alam'), b('Miri', 'Miri'), b('Langkawi', 'Langkawi'),
    ],
    vehicles: [
      b('bus', 'bas'), b('car', 'kereta'), b('motorcycle', 'motosikal'), b('lorry', 'lori'), b('train', 'tren'),
      b('bicycle', 'basikal'), b('van', 'van'), b('boat', 'bot'), b('ferry', 'feri'), b('taxi', 'teksi'),
    ],
    /* occupations, usable after "a/an" in English (en) and directly in Malay (ms) */
    jobs: [
      b('a tailor', 'seorang tukang jahit'), b('a baker', 'seorang pembuat roti'), b('a farmer', 'seorang petani'),
      b('a fisherman', 'seorang nelayan'), b('a shopkeeper', 'seorang penjaga kedai'), b('a clerk', 'seorang kerani'),
      b('a driver', 'seorang pemandu'), b('a nurse', 'seorang jururawat'), b('a teacher', 'seorang guru'),
      b('an engineer', 'seorang jurutera'), b('a technician', 'seorang juruteknik'), b('a carpenter', 'seorang tukang kayu'),
    ],
    /* school clubs / societies, sports */
    clubs: [
      b('Science Club', 'Kelab Sains'), b('Chess Club', 'Kelab Catur'), b('Scouts', 'Pengakap'), b('Football Club', 'Kelab Bola Sepak'),
      b('Drama Club', 'Kelab Drama'), b('Robotics Club', 'Kelab Robotik'), b('Choir', 'Koir'), b('Badminton Club', 'Kelab Badminton'),
      b('Art Club', 'Kelab Seni'), b('Silat Club', 'Kelab Silat'),
    ],
    sports: [
      b('football', 'bola sepak'), b('badminton', 'badminton'), b('sepak takraw', 'sepak takraw'), b('netball', 'bola jaring'),
      b('swimming', 'renang'), b('table tennis', 'pingpong'), b('hockey', 'hoki'), b('athletics', 'olahraga'),
    ],
    /* containers with a liquid / solid inside */
    containers: [
      b('water tank', 'tangki air'), b('fish pond', 'kolam ikan'), b('swimming pool', 'kolam renang'), b('aquarium', 'akuarium'),
      b('oil drum', 'dram minyak'), b('rain barrel', 'tong hujan'),
    ],
    animals: [
      b('chickens', 'ayam'), b('goats', 'kambing'), b('ducks', 'itik'), b('cows', 'lembu'), b('fish', 'ikan'), b('rabbits', 'arnab'),
    ],
    crops: [
      b('rice', 'padi'), b('oil palm', 'kelapa sawit'), b('rubber', 'getah'), b('durian', 'durian'), b('pepper', 'lada hitam'), b('coconut', 'kelapa'),
    ],
    /* school subjects */
    subjects: [
      b('Mathematics', 'Matematik'), b('Science', 'Sains'), b('English', 'Bahasa Inggeris'), b('Bahasa Melayu', 'Bahasa Melayu'),
      b('History', 'Sejarah'), b('Geography', 'Geografi'), b('Art', 'Pendidikan Seni'), b('Physical Education', 'Pendidikan Jasmani'),
    ],
    /* metric quantities: en / ms unit names for length, mass, volume, time */
    units: {
      length: [b('mm', 'mm'), b('cm', 'cm'), b('m', 'm'), b('km', 'km')],
      mass: [b('g', 'g'), b('kg', 'kg')],
      volume: [b('ml', 'ml'), b('litres', 'liter', { en1: 'litre' })],
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
