/* Variety pack x3d: extra generators for F3-7.1..7.4 "Plans and Elevations" (see tools/variety.js). */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, need, retry, sum, round } = SPM;
  const T = SPM.L, S = SPM.svg;
  const W = SPM.lines;
  const cap = SPM.cap;
  /** teaching lines reused across 7.1-7.4 */
  const ORTHW = T('An orthogonal projection needs rays that are parallel to one another and perpendicular to the projection plane.', 'Unjuran ortogon memerlukan sinar yang selari antara satu sama lain dan berserenjang dengan satah unjuran.');
  const DIMW = T('Each view shows only two of the three dimensions: plan = length and width, front elevation = length and height, side elevation = width and height.', 'Setiap paparan hanya menunjukkan dua daripada tiga ukuran: pelan = panjang dan lebar, dongakan depan = panjang dan tinggi, dongakan sisi = lebar dan tinggi.');
  const PLANEW = T('The plan is the view from directly above (horizontal plane); an elevation is the view from the front or the side (vertical plane).', 'Pelan ialah paparan terus dari atas (satah mengufuk); dongakan ialah paparan dari depan atau sisi (satah mencancang).');
  const NTS = SPM.NTS;
  const nts = (q) => T(q.en + ' ' + NTS.en, q.ms + ' ' + NTS.ms);
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

  /* ================================================================ shared figure helpers ================= */
  const CELL = 22;

  /** Plan of a cube-stack solid: rows x cols grid, each cell labelled by labelFn(i,j) (or blank). */
  function gridFig(rows, cols, labelFn, o) {
    o = o || {};
    let out = '';
    for (let i = 0; i < rows; i++)
      for (let j = 0; j < cols; j++) {
        out += S.rect(6 + j * CELL, 6 + i * CELL, CELL, CELL);
        const lab = labelFn ? labelFn(i, j) : null;
        if (lab !== null && lab !== undefined) out += S.text(6 + j * CELL + CELL / 2, 6 + i * CELL + CELL / 2, String(lab), { s: 12 });
      }
    let extra = 0;
    if (o.frontArrow) {
      const cx = 6 + (cols * CELL) / 2, y0 = 6 + rows * CELL;
      out += S.arrow(cx, y0 + 20, cx, y0 + 4) + S.text(cx, y0 + 30, o.frontArrow, { s: 11 });
      extra = 36;
    }
    return S.wrap(cols * CELL + 12, rows * CELL + 12 + extra, out, 'plan');
  }

  /** Elevation silhouette drawn from an array of column heights (unit-cube squares stacked). */
  function elevFig(heights, o) {
    o = o || {};
    const cols = heights.length;
    const maxH = Math.max(...heights, 1);
    let out = '';
    for (let j = 0; j < cols; j++) for (let k = 0; k < heights[j]; k++) out += S.rect(6 + j * CELL, 6 + (maxH - 1 - k) * CELL, CELL, CELL, { fill: 'currentColor', op: 0.08 });
    return S.wrap(cols * CELL + 12, maxH * CELL + 12, out, 'elevation');
  }

  /** derive a footprint x heights model that has genuinely different plan / front / side shapes. */
  const heightMap = (r, rows, cols, lo, hi) =>
    retry(() => {
      const m = Array.from({ length: rows }, () => Array.from({ length: cols }, () => r.int(lo === undefined ? 1 : lo, hi === undefined ? 3 : hi)));
      const front = range(0, cols - 1).map((j) => Math.max(...m.map((row) => row[j])));
      const side = range(0, rows - 1).map((i) => Math.max(...m[i]));
      need(new Set(front).size > 1 && new Set(side).size > 1);
      return { m, front, side, rows, cols };
    });
  const planFig = (m, o) => gridFig(m.length, m[0].length, (i, j) => m[i][j], o);
  const totalCubes = (m) => sum(m.map((row) => sum(row)));

  /** Simple oblique sketch of a cuboid l (right) x d (depth, receding up-right) x h (up). Solid outline + dashed hidden edges. */
  function obliqBox(l, d, h, o) {
    o = o || {};
    const sc = o.scale || 15, kx = 0.5, ky = 0.3;
    const ox = 30, oy = 14 + h * sc;
    const P = (x, y, z) => [ox + x * sc + z * sc * kx, oy - y * sc - z * sc * ky];
    const A = P(0, 0, 0), B = P(l, 0, 0), C = P(l, h, 0), D = P(0, h, 0);
    const A2 = P(0, 0, d), B2 = P(l, 0, d), C2 = P(l, h, d), D2 = P(0, h, d);
    let out = '';
    out += S.line(A[0], A[1], A2[0], A2[1], { dash: true, w: 1 });
    out += S.line(A2[0], A2[1], D2[0], D2[1], { dash: true, w: 1 });
    out += S.line(A2[0], A2[1], B2[0], B2[1], { dash: true, w: 1 });
    out += S.line(D[0], D[1], D2[0], D2[1]);
    out += S.line(B[0], B[1], B2[0], B2[1]);
    out += S.line(C[0], C[1], C2[0], C2[1]);
    out += S.line(D2[0], D2[1], C2[0], C2[1]);
    out += S.line(C2[0], C2[1], B2[0], B2[1]);
    out += S.poly([A, B, C, D]);
    if (o.labelL) out += S.text((A[0] + B[0]) / 2, A[1] + 14, o.labelL, { s: 11 });
    if (o.labelH) out += S.text(A[0] - 12, (A[1] + D[1]) / 2, o.labelH, { s: 11 });
    if (o.labelD) out += S.text((B[0] + B2[0]) / 2 + 6, (B[1] + B2[1]) / 2 - 2, o.labelD, { s: 11 });
    const W = B2[0] + 26, H = oy + 14;
    if (o.arrow === 'front') out += S.arrow(A[0] + (B[0] - A[0]) / 2, H - 2, A[0] + (B[0] - A[0]) / 2, A[1] + 4) + S.text(A[0] + (B[0] - A[0]) / 2, H, 'F', { i: true, s: 11 });
    return S.wrap(W, H, out, 'solid');
  }

  /** side-view schematic of rays meeting a plane: parallel+perpendicular (orthogonal) or radiating from a point (not). */
  function rayFig(kind) {
    const w = 200, h = 130;
    let out = S.line(30, 20, 30, 110, { w: 1.6 }); // the plane, edge-on
    out += S.text(30, 122, kind === 'para' ? T('plane', 'satah').en : '', { s: 10 });
    if (kind === 'para') {
      for (const y of [35, 55, 75, 95]) out += S.arrow(150, y, 32, y, { w: 1.1 });
    } else {
      const src = [155, 25];
      out += S.dot(src[0], src[1], 2.4);
      for (const y of [35, 55, 75, 100]) out += S.arrow(src[0], src[1], 32, y, { w: 1.1 });
    }
    return S.wrap(w, h, out, 'projection rays');
  }

  /* ================================================================ 7.1 Orthogonal projections ============ */
  const VIEWS = [
    { en: 'a plan', ms: 'pelan', planeEn: 'a horizontal plane, viewed from directly above', planeMs: 'satah mengufuk, dilihat terus dari atas' },
    { en: 'a front elevation', ms: 'dongakan depan', planeEn: 'a vertical plane, viewed from the front', planeMs: 'satah mencancang, dilihat dari depan' },
    { en: 'a side elevation', ms: 'dongakan sisi', planeEn: 'a vertical plane, viewed from the side', planeMs: 'satah mencancang, dilihat dari sisi' },
  ];
  /* view -> which two dimensions it shows / which one it collapses (used to cross with several question frames) */
  const VFACTS = [
    { v: VIEWS[0], shown: T('length and width', 'panjang dan lebar'), lost: T('the height', 'tinggi') },
    { v: VIEWS[1], shown: T('length and height', 'panjang dan tinggi'), lost: T('the width (depth)', 'lebar (kedalaman)') },
    { v: VIEWS[2], shown: T('width and height', 'lebar dan tinggi'), lost: T('the length', 'panjang') },
  ];

  const ORTHO_CASES = [
    [T('Parallel light rays fall perpendicularly onto a wall, casting the shadow of a flat cut-out shape.', 'Sinar cahaya selari jatuh secara serenjang ke atas dinding, mencampakkan bayang bentuk keratan rata.'), true, T('the rays are parallel and perpendicular to the plane', 'sinar-sinar itu selari dan berserenjang dengan satah')],
    [T('A single light bulb close to an object casts a shadow on a wall, so the rays spread outward from the bulb.', 'Sebiji mentol lampu yang dekat dengan objek mencampakkan bayang pada dinding, jadi sinar-sinar merebak keluar dari mentol itu.'), false, T('the rays radiate from a point instead of being parallel', 'sinar-sinar merebak dari satu titik dan bukan selari')],
    [T('A camera photographs a building from directly above using rays that are all parallel to one another and perpendicular to the ground.', 'Sebuah kamera memotret sebuah bangunan terus dari atas menggunakan sinar yang semuanya selari antara satu sama lain dan serenjang dengan tanah.'), true, T('the rays are parallel and perpendicular to the plane', 'sinar-sinar itu selari dan berserenjang dengan satah')],
    [T('A torch held at an angle to a wall casts a stretched shadow of a book.', 'Lampu suluh yang dipegang pada sudut condong ke dinding mencampakkan bayang buku yang teregang.'), false, T('the rays are not perpendicular to the wall', 'sinar-sinar itu tidak berserenjang dengan dinding')],
    [T('At noon, the sun is almost directly overhead, so a flagpole casts a very short shadow with rays that strike the ground almost perpendicularly.', 'Pada waktu tengah hari, matahari hampir tepat di atas kepala, jadi sebatang tiang bendera mencampakkan bayang yang sangat pendek dengan sinar yang hampir berserenjang dengan tanah.'), true, T('the (near-)parallel sun rays meet the ground at (near-)90°', 'sinar matahari yang (hampir) selari bertemu tanah pada sudut (hampir) 90°')],
    [T('In the late afternoon, the sun is low in the sky. Its rays are still parallel to one another but strike the ground at an angle far from $90^\\circ$, producing a long shadow.', 'Pada waktu petang, matahari rendah di langit. Sinarnya masih selari antara satu sama lain tetapi bertemu tanah pada sudut yang jauh dari $90^\\circ$, menghasilkan bayang yang panjang.'), false, T('the rays are not perpendicular to the ground, even though they are parallel to each other', 'sinar-sinar itu tidak berserenjang dengan tanah, walaupun ia selari antara satu sama lain')],
    [T('In a perspective drawing used by an artist, all the projection lines converge towards a single vanishing point.', 'Dalam lukisan perspektif yang digunakan oleh seorang artis, semua garis unjuran menumpu ke satu titik lenyap.'), false, T('converging rays are not parallel to one another', 'sinar yang menumpu tidaklah selari antara satu sama lain')],
    [T('An engineer draws the plan of a machine part using rays that are vertical and parallel to each other, meeting the horizontal drawing plane at right angles.', 'Seorang jurutera melukis pelan bagi bahagian sebuah mesin menggunakan sinar yang menegak dan selari antara satu sama lain, bertemu satah lukisan mengufuk pada sudut tegak.'), true, T('the rays are parallel and perpendicular to the plane', 'sinar-sinar itu selari dan berserenjang dengan satah')],
    [T('The size and shape of an orthogonal projection of a flat shape do not change if the shape is moved further from the projection plane (while staying parallel to it).', 'Saiz dan bentuk unjuran ortogon bagi suatu bentuk rata tidak berubah jika bentuk itu digerakkan lebih jauh daripada satah unjuran (sambil kekal selari dengannya).'), true, T('the rays stay parallel, so distance from the plane does not change the projected size', 'sinar kekal selari, jadi jarak dari satah tidak mengubah saiz unjuran')],
    [T('A shadow puppet held very close to a small lamp casts a shadow much larger than the puppet itself; this is an example of an orthogonal projection.', 'Sebuah patung bayang yang dipegang sangat dekat dengan sebuah lampu kecil mencampakkan bayang yang jauh lebih besar daripada patung itu sendiri; ini adalah contoh unjuran ortogon.'), false, T('the rays radiate from the small lamp rather than being parallel, so the projection is not orthogonal', 'sinar merebak dari lampu kecil itu dan bukan selari, jadi unjuran itu bukan ortogon')],
    [T('A student holds a set square flat against a table and traces around it directly with a pencil resting vertically at every point; the outline drawn is an orthogonal projection of the set square onto the table.', 'Seorang murid meletakkan sesiku set rata di atas meja dan melakar sekelilingnya terus dengan pensel yang berdiri menegak pada setiap titik; lakaran yang terhasil ialah unjuran ortogon sesiku set itu ke atas meja.'), true, T('the tracing rays (vertical pencil positions) are parallel and perpendicular to the table', 'sinar lakaran (kedudukan pensel menegak) adalah selari dan berserenjang dengan meja')],
    [T('A slide projector placed close to a screen enlarges a photograph on the slide as it projects it onto the screen.', 'Sebuah projektor slaid yang diletakkan dekat dengan skrin membesarkan sekeping gambar pada slaid semasa ia mengunjurkannya ke atas skrin.'), false, T('a projector\'s light rays spread outward from the lamp rather than staying parallel', 'sinar cahaya projektor merebak keluar dari lampu dan bukan kekal selari')],
    [T('Engineering drawings of a bracket show its plan, front elevation and side elevation, each obtained using a separate set of parallel rays perpendicular to its own plane.', 'Lukisan kejuruteraan bagi sebuah bengkok menunjukkan pelan, dongakan depan dan dongakan sisinya, setiap satu diperoleh menggunakan satu set sinar selari yang berserenjang dengan satahnya sendiri.'), true, T('each view uses rays that are parallel to each other and perpendicular to that view\'s own plane', 'setiap paparan menggunakan sinar yang selari antara satu sama lain dan berserenjang dengan satahnya sendiri')],
    [T('A photocopier scans a flat document by moving a light bar underneath it that always stays parallel to the glass, sending light straight up through the paper.', 'Sebuah mesin fotostat mengimbas sekeping dokumen rata dengan menggerakkan bar cahaya di bawahnya yang sentiasa kekal selari dengan kaca, menghantar cahaya terus ke atas melalui kertas.'), true, T('the light bar sends rays straight up (perpendicular to the glass) and stays parallel to it, so all the rays remain parallel to one another and perpendicular to the plane', 'bar cahaya menghantar sinar terus ke atas (berserenjang dengan kaca) dan kekal selari dengannya, jadi semua sinar kekal selari antara satu sama lain dan berserenjang dengan satah')],
    [T('A hand-held spotlight is swept in an arc above a stage, so the direction of its beam keeps changing as it lights different actors.', 'Sebuah lampu sorot pegang tangan diayun dalam bentuk lengkok di atas pentas, jadi arah alunan cahayanya sentiasa berubah semasa ia menyuluh pelakon yang berbeza.'), false, T('the beam direction keeps changing, so the rays at different moments are not all parallel to one another', 'arah alunan cahaya sentiasa berubah, jadi sinar pada saat yang berbeza tidak semuanya selari antara satu sama lain')],
    [T('A row of vertical rain drops falls straight down on a still day, casting shadows of the raindrops on flat ground directly below.', 'Sebaris titisan hujan menegak jatuh terus ke bawah pada suatu hari yang tenang, mencampakkan bayang titisan hujan itu di atas tanah rata terus di bawahnya.'), true, T('the falling raindrops are all parallel and strike the ground perpendicularly', 'titisan hujan yang jatuh semuanya selari dan menghentam tanah secara berserenjang')],
    [T('A candle flame flickers close beside a wall, so the shadow of a nearby object constantly changes size and shape as the flame moves.', 'Nyalaan lilin berkelip-kelip berdekatan dengan dinding, jadi bayang sebuah objek berdekatan sentiasa berubah saiz dan bentuk semasa nyalaan itu bergerak.'), false, T('a moving, nearby point source gives rays that are not parallel and not fixed in direction', 'sumber titik yang bergerak dan berdekatan memberikan sinar yang tidak selari dan tidak tetap arahnya')],
    [T('A row of identical vertical fence posts, all viewed by a drone hovering far above and looking straight down, appear in the photo as parallel-sided shapes of the same width.', 'Sebaris tiang pagar menegak yang serupa, semuanya dilihat oleh sebuah dron yang berlegar jauh di atas dan memandang terus ke bawah, kelihatan dalam foto sebagai bentuk bertepi selari dengan lebar yang sama.'), true, T('the drone\'s camera rays are effectively parallel and perpendicular to the ground far below', 'sinar kamera dron secara berkesan adalah selari dan berserenjang dengan tanah yang jauh di bawah')],
  ];
  const M1_REALWORLD = [
    [T('a satellite photograph of a stadium taken from directly overhead', 'sebuah gambar satelit sebuah stadium yang diambil terus dari atas'), VIEWS[0]],
    [T("an architect's drawing of a house as seen walking straight towards its main door", 'lukisan seorang arkitek bagi sebuah rumah seperti yang dilihat semasa berjalan terus ke arah pintu utamanya'), VIEWS[1]],
    [T('a drawing of a car as seen standing directly next to it, looking along its length', 'lukisan sebuah kereta seperti yang dilihat berdiri betul-betul di sebelahnya, memandang sepanjang panjangnya'), VIEWS[2]],
    [T("an X-ray of a patient's chest, viewed from above while lying down", 'x-ray dada seorang pesakit, dilihat dari atas semasa berbaring'), VIEWS[0]],
    [T('a floor plan of a classroom drawn by a contractor measuring straight down from the ceiling', 'pelan lantai sebuah bilik darjah yang dilukis oleh seorang kontraktor mengukur terus dari siling', ), VIEWS[0]],
    [T('a diagram of a fridge drawn by an appliance store as seen walking straight towards its door', 'gambar rajah sebuah peti sejuk yang dilukis oleh sebuah kedai perkakas seperti dilihat berjalan terus ke arah pintunya'), VIEWS[1]],
    [T('a silhouette of a bookshelf traced on paper held up beside it, looking along its depth', 'siluet sebuah rak buku yang dilakar pada kertas yang diangkat di sebelahnya, memandang sepanjang kedalamannya'), VIEWS[2]],
    [T('a dentist\'s scan of a tooth viewed from directly above the patient', 'imbasan doktor gigi bagi sebatang gigi yang dilihat terus dari atas pesakit'), VIEWS[0]],
    [T('a diagram of a wardrobe as seen standing beside it and looking along its width towards the far end', 'gambar rajah sebuah almari pakaian seperti dilihat berdiri di sebelahnya dan memandang sepanjang lebarnya ke hujung yang jauh'), VIEWS[2]],
    [T('a blueprint of a bridge support as seen walking directly towards its front face', 'pelan cetak biru sebuah penyokong jambatan seperti dilihat berjalan terus ke arah muka depannya'), VIEWS[1]],
    [T('a diagram of a filing cabinet drawn by a surveyor standing directly above it', 'gambar rajah sebuah kabinet fail yang dilukis oleh seorang juruukur yang berdiri terus di atasnya'), VIEWS[0]],
    [T('a sketch of a water tank as seen standing beside it, looking along its width', 'lakaran sebuah tangki air seperti dilihat berdiri di sebelahnya, memandang sepanjang lebarnya'), VIEWS[2]],
    [T('a poster showing a school hall as seen walking straight towards its main entrance', 'poster yang menunjukkan sebuah dewan sekolah seperti dilihat berjalan terus ke arah pintu masuk utamanya'), VIEWS[1]],
    [T('a diagram of a garden bed as seen from a drone hovering directly above it', 'gambar rajah sebuah petak taman seperti dilihat daripada sebuah dron yang berlegar terus di atasnya'), VIEWS[0]],
  ];
  const M1_ERRORS = [
    [T('"The front elevation of a cuboid shows its length and depth."', '"Dongakan depan sebuah kuboid menunjukkan panjang dan kedalamannya."'), T('front elevation shows length and HEIGHT (depth is collapsed, not shown)', 'dongakan depan menunjukkan panjang dan TINGGI (kedalaman dimampatkan, tidak ditunjukkan)')],
    [T('"The plan of a solid is obtained by viewing it from the front."', '"Pelan sebuah pepejal diperoleh dengan melihatnya dari depan."'), T('the plan is obtained by viewing from directly ABOVE, not from the front', 'pelan diperoleh dengan melihat terus dari ATAS, bukan dari depan')],
    [T('"The projection plane for a side elevation is horizontal."', '"Satah unjuran bagi dongakan sisi adalah mengufuk."'), T('the plane for a side elevation is VERTICAL, not horizontal', 'satah bagi dongakan sisi adalah MENCANCANG, bukan mengufuk')],
    [T('"Orthogonal projection rays radiate outward from a single point on the object."', '"Sinar unjuran ortogon merebak keluar dari satu titik pada objek."'), T('the rays are PARALLEL to one another, they do not radiate from a point', 'sinar itu SELARI antara satu sama lain, ia tidak merebak dari satu titik')],
    [T('"A plan and a front elevation of the same cuboid never share a common dimension."', '"Pelan dan dongakan depan bagi kuboid yang sama tidak pernah berkongsi ukuran yang sama."'), T('the plan and the front elevation DO share the length (both are read along the same direction)', 'pelan dan dongakan depan MEMANG berkongsi panjang (kedua-duanya dibaca sepanjang arah yang sama)')],
    [T('"The side elevation of a cuboid shows its length and height."', '"Dongakan sisi sebuah kuboid menunjukkan panjang dan tingginya."'), T('the side elevation shows WIDTH and height, not length (length is collapsed)', 'dongakan sisi menunjukkan LEBAR dan tinggi, bukan panjang (panjang dimampatkan)')],
    [T('"An orthogonal projection is the same thing as a perspective drawing."', '"Unjuran ortogon adalah sama seperti lukisan perspektif."'), T('a perspective drawing uses converging rays; an orthogonal projection uses parallel rays perpendicular to the plane', 'lukisan perspektif menggunakan sinar yang menumpu; unjuran ortogon menggunakan sinar selari yang berserenjang dengan satah')],
    [T('"The plan of a solid always has the same shape as its front elevation."', '"Pelan sebuah pepejal sentiasa mempunyai bentuk yang sama seperti dongakan depannya."'), T('the plan and the front elevation show different pairs of dimensions in general, so their shapes need not match', 'pelan dan dongakan depan menunjukkan pasangan ukuran yang berbeza secara amnya, jadi bentuknya tidak semestinya sepadan')],
    [T('"Viewing an object from further away changes the size of its orthogonal projection."', '"Melihat sebuah objek dari jarak yang lebih jauh mengubah saiz unjuran ortogonnya."'), T('for parallel projection rays, moving the object (while keeping it parallel to the plane) does NOT change the projected size', 'bagi sinar unjuran selari, menggerakkan objek itu (sambil kekal selari dengan satah) TIDAK mengubah saiz unjuran')],
    [T('"A front elevation and a side elevation of the same solid never share a common dimension."', '"Dongakan depan dan dongakan sisi bagi pepejal yang sama tidak pernah berkongsi ukuran yang sama."'), T('the front elevation and the side elevation DO share the height (both are read along the same vertical direction)', 'dongakan depan dan dongakan sisi MEMANG berkongsi tinggi (kedua-duanya dibaca sepanjang arah menegak yang sama)')],
    [T('"The plan of an object is drawn using rays that travel horizontally."', '"Pelan sebuah objek dilukis menggunakan sinar yang bergerak secara mengufuk."'), T('the rays used for a plan travel VERTICALLY (downward onto the horizontal plane), not horizontally', 'sinar yang digunakan untuk pelan bergerak secara MENEGAK (ke bawah ke atas satah mengufuk), bukan mengufuk')],
    [T('"A side elevation is obtained by viewing an object from directly above."', '"Dongakan sisi diperoleh dengan melihat sebuah objek terus dari atas."'), T('a side elevation is obtained by viewing from the SIDE, not from above (that gives the plan)', 'dongakan sisi diperoleh dengan melihat dari SISI, bukan dari atas (itu memberi pelan)')],
    [T('"The height of a cuboid can be read directly from its plan."', '"Tinggi sebuah kuboid boleh dibaca terus daripada pelannya."'), T('the height cannot be read from the plan; it is collapsed because the plan is viewed from directly above', 'tinggi tidak boleh dibaca daripada pelan; ia dimampatkan kerana pelan dilihat terus dari atas')],
  ];
  const g1e = [
    // true/false: is a described set-up an orthogonal projection?
    (r) => {
      const [c, ans, why] = r.pick(ORTHO_CASES);
      return { q: T(`True or false? "${c.en}" describes an orthogonal projection.`, `Betul atau salah? "${c.ms}" menghuraikan unjuran ortogon.`), a: ans ? T(`True: ${why.en}.`, `Betul: ${why.ms}.`) : T(`False: ${why.en}.`, `Salah: ${why.ms}.`), w: W(ORTHW, ans ? T(`Here both conditions hold, because ${why.en}.`, `Di sini kedua-dua syarat dipenuhi, kerana ${why.ms}.`) : T(`Here they fail, because ${why.en}.`, `Di sini syarat itu gagal, kerana ${why.ms}.`), ans ? T('So it is an orthogonal projection: True.', 'Jadi ia ialah unjuran ortogon: Betul.') : T('So it is not an orthogonal projection: False.', 'Jadi ia bukan unjuran ortogon: Salah.')), sp: 's' };
    },
    // classify: does the scenario use parallel rays or rays that radiate from a point?
    (r) => {
      const [c, ans, why] = r.pick(ORTHO_CASES);
      return { q: T(`Consider: "${c.en}" Do the rays involved travel parallel to one another, or do they radiate from a single point?`, `Pertimbangkan: "${c.ms}" Adakah sinar yang terlibat bergerak selari antara satu sama lain, atau ia merebak dari satu titik?`), a: ans ? T('Parallel to one another.', 'Selari antara satu sama lain.') : T('They radiate from a point (or are otherwise not all parallel).', 'Ia merebak dari satu titik (atau tidak semuanya selari).'), w: W(T('Look at the source: a distant or parallel source (sunlight, a scanning bar, a far-away camera) gives parallel rays, while a nearby lamp or bulb gives rays that spread out from a point.', 'Lihat sumbernya: sumber yang jauh atau selari (cahaya matahari, bar pengimbas, kamera yang jauh) memberikan sinar selari, manakala lampu atau mentol yang dekat memberikan sinar yang merebak dari satu titik.'), T(`Here ${why.en}.`, `Di sini ${why.ms}.`)), sp: 's' };
    },
    // name the view produced (rather than plane+direction) for a real-world technique
    (r) => {
      const [c, v] = r.pick(M1_REALWORLD);
      return { q: T(`What is the resulting orthogonal view called for ${c.en}?`, `Apakah nama paparan ortogon yang terhasil bagi ${c.ms}?`), a: T(v.en[0].toUpperCase() + v.en.slice(1), v.ms[0].toUpperCase() + v.ms.slice(1)), w: W(PLANEW, T(`The object is viewed on ${v.planeEn}, so the drawing is ${v.en}.`, `Objek itu dilihat pada ${v.planeMs}, jadi lukisan itu ialah ${v.ms}.`)), sp: 's' };
    },
    // cloze correction of a wrong statement
    (r) => {
      const [wrong, fix] = r.pick(M1_ERRORS);
      return { q: T(`The statement ${wrong.en} is incorrect. Write a corrected version of the underlined part in the blank: ________.`, `Pernyataan ${wrong.ms} adalah tidak tepat. Tulis versi yang dibetulkan bagi bahagian yang bergaris dalam tempat kosong: ________.`), a: T(fix.en[0].toUpperCase() + fix.en.slice(1), fix.ms[0].toUpperCase() + fix.ms.slice(1)), w: W(DIMW, T(`So the correct version is: ${fix.en}.`, `Jadi versi yang betul ialah: ${fix.ms}.`)), sp: 's' };
    },
    // name the plane + direction for a named view
    (r) => {
      const v = r.pick(VIEWS);
      return { q: T(`On which plane, and viewed from which direction, is ${v.en} formed?`, `Pada satah manakah, dan dilihat dari arah mana, ${v.ms} terbentuk?`), a: T(v.planeEn, v.planeMs), w: W(PLANEW, T(cap(v.planeEn) + '.', cap(v.planeMs) + '.')), sp: 's' };
    },
    // reverse: given plane+direction, name the view
    (r) => {
      const v = r.pick(VIEWS);
      return { q: T(`An orthogonal projection is made on ${v.planeEn}. What is this view called?`, `Suatu unjuran ortogon dibuat pada ${v.planeMs}. Apakah nama paparan ini?`), a: T(v.en[0].toUpperCase() + v.en.slice(1), v.ms[0].toUpperCase() + v.ms.slice(1)), w: W(PLANEW, T(`${cap(v.planeEn)} gives ${v.en}.`, `${cap(v.planeMs)} memberikan ${v.ms}.`)), sp: 's' };
    },
    // fill in the blank about parallel + perpendicular rays
    (r) => ({ q: T('Fill in the blanks: in an orthogonal projection, the projection rays are ________ to one another and ________ to the projection plane.', 'Isi tempat kosong: dalam unjuran ortogon, sinar unjuran adalah ________ antara satu sama lain dan ________ dengan satah unjuran.'), a: T('parallel ; perpendicular', 'selari ; berserenjang'), w: W(ORTHW, T('Both words are needed: parallel to one another, and perpendicular ($90^\\circ$) to the plane.', 'Kedua-dua perkataan diperlukan: selari antara satu sama lain, dan berserenjang ($90^\\circ$) dengan satah.')), sp: 's' }),
    // MCQ based on the ray figure: which diagram is orthogonal
    (r) => {
      const first = r.chance();
      const figs = first ? [rayFig('para'), rayFig('radiate')] : [rayFig('radiate'), rayFig('para')];
      const ansLetter = first ? 'A' : 'B';
      return { q: T('Diagram A and Diagram B each show rays meeting a plane. Which diagram shows an orthogonal projection?', 'Rajah A dan Rajah B masing-masing menunjukkan sinar yang bertemu satah. Rajah manakah menunjukkan unjuran ortogon?'), fig: T(`A: ${figs[0]} B: ${figs[1]}`, `A: ${figs[0]} B: ${figs[1]}`), a: T(`Diagram ${ansLetter}: its rays are parallel to each other and perpendicular to the plane.`, `Rajah ${ansLetter}: sinarnya selari antara satu sama lain dan berserenjang dengan satah.`), w: W(ORTHW, T(`Diagram ${ansLetter} shows equally spaced parallel arrows meeting the plane at $90^\\circ$; the other diagram shows arrows spreading out from one point, so its rays are not parallel.`, `Rajah ${ansLetter} menunjukkan anak panah selari yang sama jarak bertemu satah pada $90^\\circ$; rajah yang satu lagi menunjukkan anak panah yang merebak dari satu titik, jadi sinarnya tidak selari.`)), sp: 's' };
    },
    // identify horizontal vs vertical plane for view
    (r) => {
      const v = r.pick(VIEWS);
      const isPlan = v.en === 'a plan';
      return { q: T(`Is the projection plane used for ${v.en} horizontal or vertical?`, `Adakah satah unjuran yang digunakan untuk ${v.ms} mengufuk atau mencancang?`), a: isPlan ? T('Horizontal', 'Mengufuk') : T('Vertical', 'Mencancang'), w: W(PLANEW, isPlan ? T('A plan is viewed from above, so its plane is horizontal.', 'Pelan dilihat dari atas, jadi satahnya mengufuk.') : T('An elevation is viewed horizontally, so its plane is vertical.', 'Dongakan dilihat secara mengufuk, jadi satahnya mencancang.')), sp: 'xs' };
    },
    // simple cuboid: name which view an arrow direction gives, using the oblique figure
    (r) => {
      const l = r.int(3, 6), d = r.int(2, 4), h = r.int(2, 5);
      need(l !== d);
      const dir = r.pick([
        { en: 'from directly above, looking down', ms: 'terus dari atas, memandang ke bawah', ans: VIEWS[0] },
        { en: 'from the front, looking along the depth', ms: 'dari depan, memandang sepanjang kedalaman', ans: VIEWS[1] },
        { en: 'from the side, looking along the length', ms: 'dari sisi, memandang sepanjang panjang', ans: VIEWS[2] },
      ]);
      const fig = obliqBox(l, d, h, { labelL: `${l} cm`, labelD: `${d} cm`, labelH: `${h} cm` });
      return { q: T(`The diagram shows a cuboid. An orthogonal projection is taken ${dir.en}. What view is produced?`, `Rajah menunjukkan sebuah kuboid. Suatu unjuran ortogon diambil ${dir.ms}. Paparan apakah yang terhasil?`), fig, a: T(dir.ans.en[0].toUpperCase() + dir.ans.en.slice(1), dir.ans.ms), w: W(PLANEW, T(`Viewing ${dir.en} projects the cuboid onto ${dir.ans.planeEn}, giving ${dir.ans.en}.`, `Memandang ${dir.ms} mengunjurkan kuboid itu ke atas ${dir.ans.planeMs}, memberikan ${dir.ans.ms}.`)), sp: 's' };
    },
    // fill blank: plane + direction sentence, second phrasing
    (r) => {
      const v = r.pick(VIEWS);
      return { q: T(`Complete: ${v.en[0].toUpperCase() + v.en.slice(1)} is the image formed on ________, viewed ________.`, `Lengkapkan: ${v.ms[0].toUpperCase() + v.ms.slice(1)} ialah imej yang terbentuk pada ________, dilihat ________.`), a: T(v.planeEn, v.planeMs), w: W(PLANEW, T(cap(v.planeEn) + '.', cap(v.planeMs) + '.')), sp: 's' };
    },
    // true/false: the plane used for a named view is vertical
    (r) => {
      const v = r.pick(VIEWS);
      const isVert = v.en !== 'a plan';
      return { q: T(`True or false? The projection plane used to obtain ${v.en} is vertical.`, `Betul atau salah? Satah unjuran yang digunakan untuk memperoleh ${v.ms} adalah mencancang.`), a: isVert ? T('True.', 'Betul.') : T('False; it is horizontal.', 'Salah; ia mengufuk.'), w: W(PLANEW, isVert ? T(`${cap(v.en)} is an elevation, viewed horizontally, so its plane is vertical: True.`, `${cap(v.ms)} ialah dongakan, dilihat secara mengufuk, jadi satahnya mencancang: Betul.`) : T('A plan is viewed from directly above, so its plane is horizontal: False.', 'Pelan dilihat terus dari atas, jadi satahnya mengufuk: Salah.')), sp: 'xs' };
    },
    // MCQ: which of four statements correctly defines orthogonal projection
    (r) => {
      const correct = T('The projection rays are parallel to each other and perpendicular to the projection plane.', 'Sinar unjuran adalah selari antara satu sama lain dan berserenjang dengan satah unjuran.');
      const distractors = [
        T('The projection rays all pass through a single fixed viewpoint.', 'Semua sinar unjuran melalui satu titik pandang tetap.'),
        T('The projection rays are parallel to the projection plane.', 'Sinar unjuran adalah selari dengan satah unjuran.'),
        T('The projection rays may meet the plane at any convenient angle.', 'Sinar unjuran boleh bertemu satah pada sebarang sudut yang sesuai.'),
      ];
      const opts = r.shuffle([correct, ...distractors]);
      const letter = 'ABCD'[opts.indexOf(correct)];
      const lines = opts.map((o, i) => T(`${'ABCD'[i]}) ${o.en}`, `${'ABCD'[i]}) ${o.ms}`));
      return { q: T(`Which statement correctly defines an orthogonal projection?<br>${lines.map((x) => x.en).join('<br>')}`, `Pernyataan manakah yang mentakrifkan unjuran ortogon dengan betul?<br>${lines.map((x) => x.ms).join('<br>')}`), a: T(`${letter}) ${correct.en}`, `${letter}) ${correct.ms}`), w: W(ORTHW, T('Rays through one viewpoint (perspective), rays parallel to the plane, or rays at any angle all fail one of the two conditions.', 'Sinar melalui satu titik pandang (perspektif), sinar yang selari dengan satah, atau sinar pada sebarang sudut semuanya gagal memenuhi salah satu daripada dua syarat itu.'), T(`${letter}) ${correct.en}`, `${letter}) ${correct.ms}`)), sp: 'm' };
    },
    // simple recall: name the two projection planes used in this chapter
    (r) => ({ q: T('Name the two kinds of projection plane used when drawing plans and elevations, and the direction each is viewed from.', 'Namakan dua jenis satah unjuran yang digunakan semasa melukis pelan dan dongakan, serta arah setiap satu dilihat.'), a: T('A horizontal plane, viewed from above (gives the plan); a vertical plane, viewed from the front or side (gives an elevation).', 'Satah mengufuk, dilihat dari atas (memberi pelan); satah mencancang, dilihat dari depan atau sisi (memberi dongakan).'), w: W(PLANEW, T('Horizontal plane $\\to$ plan; vertical plane $\\to$ front or side elevation.', 'Satah mengufuk $\\to$ pelan; satah mencancang $\\to$ dongakan depan atau sisi.')), sp: 's' }),
    // e: which dimension is NOT shown on a given single view
    (r) => {
      const v = r.pick([
        { view: VIEWS[0], lost: T('the height', 'tinggi') },
        { view: VIEWS[1], lost: T('the depth (width, front-to-back)', 'kedalaman (lebar, depan ke belakang)') },
        { view: VIEWS[2], lost: T('the length', 'panjang') },
      ]);
      return { q: T(`Which dimension of a cuboid is NOT shown on ${v.view.en}?`, `Ukuran manakah bagi sebuah kuboid yang TIDAK ditunjukkan pada ${v.view.ms}?`), a: v.lost, w: W(DIMW, T(`The projection rays for ${v.view.en} run along ${v.lost.en}, so that dimension is collapsed: ${v.lost.en}.`, `Sinar unjuran bagi ${v.view.ms} bergerak sepanjang ${v.lost.ms}, jadi ukuran itu dimampatkan: ${v.lost.ms}.`)), sp: 's' };
    },
    // e: which TWO dimensions ARE shown on a given view (complements the "lost" question)
    (r) => {
      const f = r.pick(VFACTS);
      return { q: T(`Which two dimensions of a cuboid are shown on ${f.v.en}?`, `Ukuran manakah bagi sebuah kuboid yang ditunjukkan pada ${f.v.ms}?`), a: f.shown, w: W(DIMW, T(`${cap(f.v.en)} keeps ${f.shown.en} and collapses ${f.lost.en}.`, `${cap(f.v.ms)} mengekalkan ${f.shown.ms} dan memampatkan ${f.lost.ms}.`)), sp: 'xs' };
    },
    // e: reverse-engineering - which view to use to read off two named dimensions
    (r) => {
      const f = r.pick(VFACTS);
      return { q: T(`A worker wants to read off ${f.shown.en} of a cuboid directly from a single drawing. Which view should she use?`, `Seorang pekerja ingin membaca ${f.shown.ms} sebuah kuboid terus daripada satu lukisan. Paparan manakah yang perlu dia gunakan?`), a: T(f.v.en[0].toUpperCase() + f.v.en.slice(1), f.v.ms[0].toUpperCase() + f.v.ms.slice(1)), w: W(DIMW, T(`The view that shows ${f.shown.en} is ${f.v.en}.`, `Paparan yang menunjukkan ${f.shown.ms} ialah ${f.v.ms}.`)), sp: 's' };
    },
    // e: real-world scenario -> is the resulting drawing a plan or an elevation? (binary, simpler than the m-level version)
    (r) => {
      const [c, v] = r.pick(M1_REALWORLD);
      const isPlan = v.en === VIEWS[0].en;
      return { q: T(`Consider ${c.en}. Is the resulting drawing a plan or an elevation?`, `Pertimbangkan ${c.ms}. Adakah lukisan yang terhasil sebuah pelan atau dongakan?`), a: isPlan ? T('A plan.', 'Sebuah pelan.') : T('An elevation.', 'Sebuah dongakan.'), w: W(PLANEW, isPlan ? T('The object is viewed from directly above, so the drawing is a plan.', 'Objek itu dilihat terus dari atas, jadi lukisan itu ialah pelan.') : T('The object is viewed horizontally (from the front or the side), so the drawing is an elevation.', 'Objek itu dilihat secara mengufuk (dari depan atau sisi), jadi lukisan itu ialah dongakan.')), sp: 'xs' };
    },
  ];

  const g1m = [
    // practical implication: would the described technique give an accurate engineering plan/elevation?
    (r) => {
      const [c, ans, why] = r.pick(ORTHO_CASES);
      return { q: T(`A draughtsman wants to produce an accurate technical plan or elevation. Could the method "${c.en}" be used directly for this purpose? Justify your answer.`, `Seorang jurulukis ingin menghasilkan pelan atau dongakan teknikal yang tepat. Bolehkah kaedah "${c.ms}" digunakan terus untuk tujuan ini? Berikan justifikasi.`), a: ans ? T(`Yes: ${why.en}, which is exactly what an orthogonal projection requires.`, `Ya: ${why.ms}, iaitu tepat apa yang diperlukan oleh unjuran ortogon.`) : T(`No: ${why.en}, so the image would be distorted and not a true orthogonal projection.`, `Tidak: ${why.ms}, jadi imej itu akan terherot dan bukan unjuran ortogon yang betul.`), w: W(ORTHW, T(`In this method ${why.en}.`, `Dalam kaedah ini ${why.ms}.`), ans ? T('Both conditions are met, so the method gives a true plan or elevation.', 'Kedua-dua syarat dipenuhi, jadi kaedah itu memberikan pelan atau dongakan yang betul.') : T('A condition is broken, so the image is distorted and cannot be used as a technical view.', 'Satu syarat dilanggar, jadi imej itu terherot dan tidak boleh digunakan sebagai paparan teknikal.')), sp: 'm' };
    },
    // MCQ: which two dimensions are shown on a named view (distractor pairs)
    (r) => {
      const f = r.pick(VFACTS);
      const correct = f.shown;
      const distractors = VFACTS.filter((x) => x !== f).map((x) => x.shown);
      const opts = r.shuffle([correct, ...distractors]);
      const letter = 'ABC'[opts.indexOf(correct)];
      const lines = opts.map((o, i) => T(`${'ABC'[i]}) ${o.en}`, `${'ABC'[i]}) ${o.ms}`));
      return { q: T(`Which pair of dimensions is shown on ${f.v.en}?<br>${lines.map((x) => x.en).join('<br>')}`, `Pasangan ukuran manakah yang ditunjukkan pada ${f.v.ms}?<br>${lines.map((x) => x.ms).join('<br>')}`), a: T(`${letter}) ${correct.en}`, `${letter}) ${correct.ms}`), w: W(DIMW, T(`${cap(f.v.en)} collapses ${f.lost.en}, leaving ${f.shown.en}.`, `${cap(f.v.ms)} memampatkan ${f.lost.ms}, meninggalkan ${f.shown.ms}.`), T(`${letter}) ${correct.en}`, `${letter}) ${correct.ms}`)), sp: 'm' };
    },
    // compare which dimensions survive in two named views of a cuboid
    (r) => {
      const l = r.int(4, 10), w = r.int(2, 6), h = r.int(2, 7);
      need(l !== w && l !== h && w !== h);
      const pair = r.pick([
        [VIEWS[0], VIEWS[1], `${l} cm by ${w} cm`, `${l} cm by ${h} cm`, 'the height', 'the width'],
        [VIEWS[1], VIEWS[2], `${l} cm by ${h} cm`, `${w} cm by ${h} cm`, 'the width', 'the length'],
        [VIEWS[0], VIEWS[2], `${l} cm by ${w} cm`, `${w} cm by ${h} cm`, 'the height', 'the length'],
      ]);
      const [vA, vB, dimA, dimB, lostA, lostB] = pair;
      return {
        q: T(`A cuboid is ${l} cm long, ${w} cm wide and ${h} cm high. State the dimensions shown on (a) ${vA.en}, (b) ${vB.en}, and name the one dimension that does not appear on each view.`,
          `Sebuah kuboid panjangnya ${l} cm, lebarnya ${w} cm dan tingginya ${h} cm. Nyatakan ukuran yang ditunjukkan pada (a) ${vA.ms}, (b) ${vB.ms}, dan namakan satu ukuran yang tidak muncul pada setiap paparan itu.`),
        a: T(`(a) ${dimA}; ${lostA} is collapsed (not shown). (b) ${dimB}; ${lostB} is collapsed (not shown).`, `(a) ${dimA}; ${lostA === 'the height' ? 'tinggi' : lostA === 'the width' ? 'lebar' : 'panjang'} tidak ditunjukkan. (b) ${dimB}; ${lostB === 'the height' ? 'tinggi' : lostB === 'the width' ? 'lebar' : 'panjang'} tidak ditunjukkan.`),
        w: W(DIMW, T(`(a) ${cap(vA.en)}: ${dimA}, so ${lostA} does not appear.`, `(a) ${cap(vA.ms)}: ${dimA}, jadi ${lostA === 'the height' ? 'tinggi' : lostA === 'the width' ? 'lebar' : 'panjang'} tidak muncul.`), T(`(b) ${cap(vB.en)}: ${dimB}, so ${lostB} does not appear.`, `(b) ${cap(vB.ms)}: ${dimB}, jadi ${lostB === 'the height' ? 'tinggi' : lostB === 'the width' ? 'lebar' : 'panjang'} tidak muncul.`)),
        sp: 's',
      };
    },
    // explain why plan and front elevation of an asymmetric cuboid look different (shape comparison)
    (r) => {
      const l = r.int(5, 9), w = r.int(2, 4), h = r.int(3, 6);
      need(l !== w && w !== h);
      return {
        q: T(`A cuboid measures ${l} cm by ${w} cm by ${h} cm (length, width, height). Its plan and its front elevation are both rectangles. Explain whether these two rectangles are the same size, and why.`,
          `Sebuah kuboid berukuran ${l} cm dengan ${w} cm dengan ${h} cm (panjang, lebar, tinggi). Pelan dan dongakan depannya kedua-duanya berbentuk segi empat tepat. Terangkan sama ada kedua-dua segi empat tepat itu bersaiz sama, dan mengapa.`),
        a: T(`No, they differ in general. The plan is ${l} cm by ${w} cm (length by width); the front elevation is ${l} cm by ${h} cm (length by height). They share the length ${l} cm but the other side is the width for the plan and the height for the elevation, and ${w} \\neq ${h} here.`,
          `Tidak, kedua-duanya berbeza secara amnya. Pelan ialah ${l} cm dengan ${w} cm (panjang dengan lebar); dongakan depan ialah ${l} cm dengan ${h} cm (panjang dengan tinggi). Kedua-duanya berkongsi panjang ${l} cm tetapi sisi yang satu lagi ialah lebar bagi pelan dan tinggi bagi dongakan, dan ${w} \\neq ${h} di sini.`),
        w: W(DIMW, T(`Plan: $${l} \\times ${w}$`, `Pelan: $${l} \\times ${w}$`), T(`Front elevation: $${l} \\times ${h}$`, `Dongakan depan: $${l} \\times ${h}$`), T(`They share the length $${l}$ cm, but $${w} \\neq ${h}$, so the two rectangles are not the same size.`, `Kedua-duanya berkongsi panjang $${l}$ cm, tetapi $${w} \\neq ${h}$, jadi kedua-dua segi empat tepat itu tidak sama saiz.`)),
        sp: 'm',
      };
    },
    // true/false with justification about a non-orthogonal claim (slanted rays)
    (r) => {
      const ang = r.pick([20, 30, 40, 50, 60, 70]);
      return { q: T(`A technical drawing is made by rays that all make an angle of $${ang}^\\circ$ with the projection plane (not $90^\\circ$). Is this an orthogonal projection? Justify your answer.`, `Suatu lukisan teknikal dibuat menggunakan sinar yang semuanya membuat sudut $${ang}^\\circ$ dengan satah unjuran (bukan $90^\\circ$). Adakah ini unjuran ortogon? Berikan justifikasi.`), a: T(`No. An orthogonal projection requires the rays to be perpendicular ($90^\\circ$) to the plane; here they meet it at $${ang}^\\circ$, so it is not an orthogonal projection.`, `Tidak. Unjuran ortogon memerlukan sinar berserenjang ($90^\\circ$) dengan satah; di sini sinar bertemu satah pada $${ang}^\\circ$, jadi ini bukan unjuran ortogon.`), w: W(ORTHW, `$${ang}^\\circ \\neq 90^\\circ$`, T('The rays are parallel but not perpendicular to the plane, so it is not an orthogonal projection.', 'Sinar itu selari tetapi tidak berserenjang dengan satah, jadi ia bukan unjuran ortogon.')), sp: 's' };
    },
    // matching: given 3 arrows into a cube (letters), match each to plan/front/side
    (r) => {
      const order = r.shuffle(['plan', 'front', 'side']);
      const arrowLetters = ['P', 'Q', 'R'];
      const descByKey = { plan: T('vertically downward', 'menegak ke bawah'), front: T('horizontally, straight into the front face', 'mengufuk, terus ke muka depan'), side: T('horizontally, straight into the side face', 'mengufuk, terus ke muka sisi') };
      const nameByKey = { plan: VIEWS[0], front: VIEWS[1], side: VIEWS[2] };
      const lines = arrowLetters.map((L, i) => T(`Arrow ${L}: points ${descByKey[order[i]].en}.`, `Anak panah ${L}: menunjuk ${descByKey[order[i]].ms}.`));
      const ansLines = arrowLetters.map((L, i) => T(`$${L}$ → ${nameByKey[order[i]].en}`, `$${L}$ → ${nameByKey[order[i]].ms}`));
      return { q: T(`Three arrows show the direction of projection onto the faces of a box. ${lines.map((x) => x.en).join(' ')} Match each arrow to the view it produces.`, `Tiga anak panah menunjukkan arah unjuran ke atas muka sebuah kotak. ${lines.map((x) => x.ms).join(' ')} Padankan setiap anak panah dengan paparan yang terhasil.`), a: SPM.lines(...ansLines), w: W(PLANEW, ...ansLines), sp: 'm' };
    },
    // real-world classification: which projection plane / view does a described technique correspond to
    (r) => {
      const [c, v] = r.pick(M1_REALWORLD);
      return { q: T(`Which orthogonal view is best described by ${c.en}? Name the view and its projection plane.`, `Paparan ortogon manakah yang paling tepat diterangkan oleh ${c.ms}? Namakan paparan itu dan satah unjurannya.`), a: T(`${v.en[0].toUpperCase() + v.en.slice(1)}: ${v.planeEn}.`, `${v.ms[0].toUpperCase() + v.ms.slice(1)}: ${v.planeMs}.`), w: W(PLANEW, T(`The viewing direction described here is ${v.planeEn}, which gives ${v.en}.`, `Arah pandangan yang dihuraikan di sini ialah ${v.planeMs}, yang memberikan ${v.ms}.`)), sp: 's' };
    },
    // MCQ: pick the correct definition among distractors that mirror common misconceptions (m-level, harder distractors)
    (r) => {
      const correct = T('Orthogonal projection rays are parallel to one another and meet the projection plane at $90^\\circ$.', 'Sinar unjuran ortogon adalah selari antara satu sama lain dan bertemu satah unjuran pada $90^\\circ$.');
      const distractors = [
        T('Orthogonal projection rays converge towards the object, like light from a torch held close by.', 'Sinar unjuran ortogon menumpu ke arah objek, seperti cahaya daripada lampu suluh yang dipegang berdekatan.'),
        T('Orthogonal projection rays are parallel to one another and meet the projection plane at $45^\\circ$.', 'Sinar unjuran ortogon adalah selari antara satu sama lain dan bertemu satah unjuran pada $45^\\circ$.'),
        T('Orthogonal projection rays must all pass through the centre of the object.', 'Sinar unjuran ortogon mesti semuanya melalui pusat objek.'),
      ];
      const opts = r.shuffle([correct, ...distractors]);
      const letter = 'ABCD'[opts.indexOf(correct)];
      const lines = opts.map((o, i) => T(`${'ABCD'[i]}) ${o.en}`, `${'ABCD'[i]}) ${o.ms}`));
      return { q: T(`Which statement is correct?<br>${lines.map((x) => x.en).join('<br>')}`, `Pernyataan manakah yang betul?<br>${lines.map((x) => x.ms).join('<br>')}`), a: T(`${letter}) ${correct.en}`, `${letter}) ${correct.ms}`), w: W(ORTHW, T('Converging rays, rays through the centre, and rays at $45^\\circ$ each break one of the two conditions.', 'Sinar yang menumpu, sinar melalui pusat, dan sinar pada $45^\\circ$ masing-masing melanggar salah satu daripada dua syarat itu.'), T(`${letter}) ${correct.en}`, `${letter}) ${correct.ms}`)), sp: 'm' };
    },
    // compare plans of two different solids with the same footprint-derived shape claim (true/false + justify)
    (r) => {
      const l = r.int(4, 8), w = r.int(3, 6), h1 = r.int(2, 4), h2 = r.int(h1 + 1, h1 + 4);
      need(l !== w);
      return { q: T(`Two cuboids stand side by side. Both have a base of $${l}$ cm by $${w}$ cm, but the first is $${h1}$ cm tall and the second is $${h2}$ cm tall. True or false: their plans are identical rectangles.`, `Dua kuboid berdiri bersebelahan. Kedua-duanya mempunyai tapak $${l}$ cm dengan $${w}$ cm, tetapi yang pertama tingginya $${h1}$ cm dan yang kedua tingginya $${h2}$ cm. Betul atau salah: pelan kedua-duanya ialah segi empat tepat yang serupa.`), a: T(`True. The plan depends only on the base (length and width), which is the same $${l}$ cm by $${w}$ cm for both; the height does not appear on the plan.`, `Betul. Pelan hanya bergantung pada tapak (panjang dan lebar), iaitu sama $${l}$ cm dengan $${w}$ cm bagi kedua-duanya; tinggi tidak muncul pada pelan.`), w: W(DIMW, T(`Plan: $${l} \\times ${w}$`, `Pelan: $${l} \\times ${w}$`), T(`The heights $${h1}$ cm and $${h2}$ cm are collapsed by the downward projection, so both plans are the same rectangle: True.`, `Tinggi $${h1}$ cm dan $${h2}$ cm dimampatkan oleh unjuran ke bawah, jadi kedua-dua pelan ialah segi empat tepat yang sama: Betul.`)), sp: 's' };
    },
    // spot and correct the error in a student's statement
    (r) => {
      const [wrong, fix] = r.pick(M1_ERRORS);
      return { q: T(`A student wrote the statement: ${wrong.en} Identify the error and correct it.`, `Seorang murid menulis pernyataan: ${wrong.ms} Kenal pasti kesilapan itu dan betulkannya.`), a: T(`Error: ${fix.en}.`, `Kesilapan: ${fix.ms}.`), w: W(DIMW, T(`Checking the statement against this: ${fix.en}.`, `Menyemak pernyataan itu dengan ini: ${fix.ms}.`)), sp: 's' };
    },
    // numeric: given plan & front elevation dims, deduce the side elevation
    (r) => {
      const l = r.int(4, 10), w = r.int(2, 6), h = r.int(2, 7);
      need(l !== w && l !== h && w !== h);
      return { q: T(`A cuboid's plan measures $${l}$ cm by $${w}$ cm and its front elevation (viewed along the width) measures $${l}$ cm by $${h}$ cm. Find the dimensions of its side elevation.`, `Pelan sebuah kuboid berukuran $${l}$ cm dengan $${w}$ cm dan dongakan depannya (dilihat sepanjang lebar) berukuran $${l}$ cm dengan $${h}$ cm. Cari ukuran dongakan sisinya.`), a: T(`$${w}$ cm by $${h}$ cm (width by height)`, `$${w}$ cm dengan $${h}$ cm (lebar dengan tinggi)`), w: W(DIMW, T(`Plan $= \\text{length} \\times \\text{width}$, so length $= ${l}$ cm and width $= ${w}$ cm.`, `Pelan $= \\text{panjang} \\times \\text{lebar}$, jadi panjang $= ${l}$ cm dan lebar $= ${w}$ cm.`), T(`Front elevation $= \\text{length} \\times \\text{height}$, so height $= ${h}$ cm.`, `Dongakan depan $= \\text{panjang} \\times \\text{tinggi}$, jadi tinggi $= ${h}$ cm.`), T(`Side elevation $= \\text{width} \\times \\text{height} = ${w} \\times ${h}$ cm.`, `Dongakan sisi $= \\text{lebar} \\times \\text{tinggi} = ${w} \\times ${h}$ cm.`)), sp: 's' };
    },
    // m: explain why a named view cannot show a stated dimension (crosses VFACTS)
    (r) => {
      const f = r.pick(VFACTS);
      return { q: T(`Explain why ${f.v.en} of a cuboid cannot be used, on its own, to find ${f.lost.en} of the cuboid.`, `Terangkan mengapa ${f.v.ms} sebuah kuboid tidak dapat digunakan, dengan sendirinya, untuk mencari ${f.lost.ms} kuboid itu.`), a: T(`The rays used to form ${f.v.en} are parallel to ${f.lost.en === 'the height' ? 'the vertical' : f.lost.en === 'the length' ? 'the length' : 'the width'} direction, so that dimension is collapsed to zero thickness in the image and cannot be read off; only ${f.shown.en} remain visible.`, `Sinar yang digunakan untuk membentuk ${f.v.ms} adalah selari dengan arah yang dimampatkan, jadi ukuran itu dimampatkan kepada ketebalan sifar dalam imej dan tidak dapat dibaca; hanya ${f.shown.ms} yang kekal kelihatan.`), w: W(DIMW, T(`${cap(f.v.en)} shows ${f.shown.en} only.`, `${cap(f.v.ms)} hanya menunjukkan ${f.shown.ms}.`), T(`Its projection rays run along ${f.lost.en}, so every point along that direction lands on the same image point and the dimension disappears.`, `Sinar unjurannya bergerak sepanjang ${f.lost.ms}, jadi setiap titik pada arah itu jatuh pada titik imej yang sama dan ukuran itu hilang.`)), sp: 'm' };
    },
    // m: real-world scenario -> horizontal or vertical plane (crosses M1_REALWORLD with a new frame)
    (r) => {
      const [c, v] = r.pick(M1_REALWORLD);
      const isPlan = v.en === VIEWS[0].en;
      return { q: T(`Consider ${c.en}. Is the projection plane used here horizontal or vertical, and is it the same plane used for a plan or for an elevation?`, `Pertimbangkan ${c.ms}. Adakah satah unjuran yang digunakan di sini mengufuk atau mencancang, dan adakah ia satah yang sama seperti yang digunakan untuk pelan atau dongakan?`), a: isPlan ? T('Horizontal; the same plane as a plan.', 'Mengufuk; satah yang sama seperti pelan.') : T('Vertical; the same plane as an elevation.', 'Mencancang; satah yang sama seperti dongakan.'), w: W(PLANEW, T(`Here the object is seen on ${v.planeEn}, which is the plane of ${v.en}.`, `Di sini objek itu dilihat pada ${v.planeMs}, iaitu satah bagi ${v.ms}.`)), sp: 's' };
    },
  ];

  const g1a = [
    // composite solid (two stacked cuboid layers), reason which edges correspond across plan and front elevation
    (r) => {
      const l1 = r.int(6, 9), d1 = r.int(4, 6), l2 = r.int(2, 4), h1 = r.int(2, 3), h2 = r.int(2, 4);
      need(l2 < l1);
      const fig = obliqBox(l1, d1, h1 + h2, { labelL: `${l1} cm`, labelD: `${d1} cm`, labelH: `${h1 + h2} cm` });
      return {
        q: T(`The solid shown is a base slab ${l1} cm long, ${d1} cm deep and ${h1} cm high, with a smaller block ${l2} cm long sitting centrally on top rising a further ${h2} cm. When this solid is projected orthogonally onto a horizontal plane from directly above, explain which edges of the top block coincide with (appear on top of) edges of the base slab in the resulting plan, and which edges remain visible as separate lines.`,
          `Pepejal yang ditunjukkan ialah tapak berukuran panjang ${l1} cm, kedalaman ${d1} cm dan tinggi ${h1} cm, dengan sebuah blok lebih kecil sepanjang ${l2} cm terletak di tengah di atasnya, naik lagi ${h2} cm. Apabila pepejal ini diunjurkan secara ortogon ke atas satah mengufuk dari terus atas, terangkan tepi blok atas yang manakah bertindih (muncul di atas) tepi tapak dalam pelan yang terhasil, dan tepi manakah kekal kelihatan sebagai garis berasingan.`),
        fig,
        a: T(`Looking straight down, the depth direction is collapsed, so only the length and width outlines matter. The two side edges of the top block (running in the depth direction) project onto the same lines as the corresponding side edges of the base slab only where they align; since the top block is centred and narrower ($${l2} < ${l1}$), its front and back edges appear as new lines inside the outline of the base slab, while its own two side edges are separate vertical lines inside the base rectangle.`,
          `Apabila dilihat terus ke bawah, arah kedalaman dimampatkan, jadi hanya garis panjang dan lebar yang penting. Dua tepi sisi blok atas (yang berjalan pada arah kedalaman) hanya terunjur pada garis yang sama dengan tepi sisi tapak yang sepadan jika sejajar; oleh kerana blok atas berada di tengah dan lebih sempit ($${l2} < ${l1}$), tepi depan dan belakangnya muncul sebagai garis baharu di dalam garis luar tapak, manakala dua tepi sisinya sendiri ialah garis menegak berasingan di dalam segi empat tepat tapak.`),
        w: W(T('Viewing from directly above collapses the height, so the plan is just the outline of the footprint, with the edges of the upper block drawn where they are seen from above.', 'Memandang terus dari atas memampatkan tinggi, jadi pelan hanyalah garis luar tapak, dengan tepi blok atas dilukis di tempat ia kelihatan dari atas.'), T(`The base slab gives the outer rectangle $${l1}$ cm by $${d1}$ cm.`, `Tapak memberikan segi empat tepat luar $${l1}$ cm dengan $${d1}$ cm.`), T(`The top block is centred and shorter ($${l2} \\lt ${l1}$), so its two end edges fall inside that rectangle and are drawn as separate lines; any edge that lines up exactly with a base edge is hidden underneath it.`, `Blok atas berada di tengah dan lebih pendek ($${l2} \\lt ${l1}$), jadi dua tepi hujungnya jatuh di dalam segi empat tepat itu dan dilukis sebagai garis berasingan; mana-mana tepi yang sejajar tepat dengan tepi tapak tersembunyi di bawahnya.`)),
        sp: 'l',
      };
    },
    // given plan+front elevation shapes described, decide if the described combination is possible for a single orthogonal system
    (r) => {
      const l = r.int(4, 8), w = r.int(3, 6), h = r.int(3, 7);
      const bad = r.chance();
      const wrongLen = l + r.pick([1, -1, 2]) * r.pick([1, -1]);
      need(wrongLen > 0 && wrongLen !== l);
      const shownLen = bad ? wrongLen : l;
      return {
        q: T(`A cuboid is ${l} cm long, ${w} cm wide and ${h} cm high. Its plan is drawn as ${l} cm by ${w} cm. Its front elevation (viewed along the width) is drawn as ${shownLen} cm by ${h} cm. Are these two views consistent with a single orthogonal projection system? Explain, using the fact that corresponding edges must agree in length.`,
          `Sebuah kuboid panjangnya ${l} cm, lebarnya ${w} cm dan tingginya ${h} cm. Pelannya dilukis sebagai ${l} cm dengan ${w} cm. Dongakan depannya (dilihat sepanjang lebar) dilukis sebagai ${shownLen} cm dengan ${h} cm. Adakah kedua-dua paparan ini konsisten dengan satu sistem unjuran ortogon? Terangkan, menggunakan fakta bahawa tepi yang sepadan mesti sama panjang.`),
        a: bad
          ? T(`No. The plan and the front elevation must share the same length (both read along the same direction). Here the plan shows ${l} cm but the front elevation shows ${shownLen} cm, so they are inconsistent.`, `Tidak. Pelan dan dongakan depan mesti berkongsi panjang yang sama (kedua-duanya dibaca sepanjang arah yang sama). Di sini pelan menunjukkan ${l} cm tetapi dongakan depan menunjukkan ${shownLen} cm, jadi kedua-duanya tidak konsisten.`)
          : T(`Yes. Both views show a length of ${l} cm along the shared direction, so they are consistent with one orthogonal projection system.`, `Ya. Kedua-dua paparan menunjukkan panjang ${l} cm sepanjang arah yang sama, jadi kedua-duanya konsisten dengan satu sistem unjuran ortogon.`),
        w: W(DIMW, T('The plan and the front elevation both show the length, so that measurement must agree in the two views.', 'Pelan dan dongakan depan kedua-duanya menunjukkan panjang, jadi ukuran itu mesti sepadan dalam kedua-dua paparan.'), T(`Plan length $= ${l}$ cm; front elevation length $= ${shownLen}$ cm.`, `Panjang pelan $= ${l}$ cm; panjang dongakan depan $= ${shownLen}$ cm.`), bad ? T(`$${l} \\neq ${shownLen}$, so the two views are not consistent.`, `$${l} \\neq ${shownLen}$, jadi kedua-dua paparan tidak konsisten.`) : T(`$${l} = ${shownLen}$, so the two views are consistent.`, `$${l} = ${shownLen}$, jadi kedua-dua paparan konsisten.`)),
        sp: 'm',
      };
    },
    // multi-part reasoning with a height-map based composite solid: identify what plan alone cannot tell you
    (r) => {
      const { m, front, side } = heightMap(r, 2, 3, 1, 3);
      const fig = planFig(m);
      return {
        q: SPM.parts([
          T('The plan of a cube-stack solid is shown, with the number of stacked unit cubes marked at each position. State one piece of information that the plan alone gives directly.', 'Pelan sebuah pepejal timbunan kiub ditunjukkan, dengan bilangan kiub unit yang ditindan ditandakan pada setiap kedudukan.'),
          T('State one piece of information that the plan alone cannot give, and name the view(s) needed to obtain it.', 'Nyatakan satu maklumat yang pelan sahaja tidak dapat berikan, dan namakan paparan yang diperlukan untuk mendapatkannya.'),
        ]),
        fig,
        a: SPM.parts([
          T('The footprint (occupied positions) and the number of cubes stacked at each position, e.g. the tallest stack shown is 3.', 'Tapak (kedudukan yang ditempati) dan bilangan kiub yang ditindan pada setiap kedudukan.'),
          T('The plan does not by itself show the height profile as seen from the front or the side (which columns/rows are tallest when viewed horizontally); the front elevation and side elevation are needed for that.', 'Pelan sahaja tidak menunjukkan profil ketinggian yang dilihat dari depan atau sisi; dongakan depan dan dongakan sisi diperlukan untuk itu.'),
        ]),
        w: W(DIMW, T(`(a) The plan is the view from above, so it gives the footprint and (here, from the numbers written on it) the stack height at each position; the tallest stack shown is ${Math.max(...front)}.`, `(a) Pelan ialah paparan dari atas, jadi ia memberikan tapak dan (di sini, daripada nombor yang tertulis padanya) ketinggian timbunan pada setiap kedudukan; timbunan tertinggi yang ditunjukkan ialah ${Math.max(...front)}.`), T(`(b) It does not show the height profile seen horizontally: the front elevation (column heights ${front.join(', ')}) and the side elevation (row heights ${side.join(', ')}) are needed for that.`, `(b) Ia tidak menunjukkan profil ketinggian yang dilihat secara mengufuk: dongakan depan (ketinggian lajur ${front.join(', ')}) dan dongakan sisi (ketinggian baris ${side.join(', ')}) diperlukan untuk itu.`)),
        sp: 'm',
      };
    },
    // coordinate version: project vertices of a box onto a named plane
    (r) => {
      const l = r.int(3, 8), w = r.int(2, 6), h = r.int(2, 6);
      need(l !== w && l !== h);
      const pts = { A: [0, 0, 0], B: [l, 0, 0], C: [l, w, 0], G: [l, w, h] };
      const keys = r.sample(Object.keys(pts), 2);
      const view = r.pick([
        { name: VIEWS[0], drop: 2, ax: '(x, y)' },
        { name: VIEWS[1], drop: 1, ax: '(x, z)' },
        { name: VIEWS[2], drop: 0, ax: '(y, z)' },
      ]);
      const proj = (p) => p.filter((_, i) => i !== view.drop);
      const listQ = keys.map((k) => `$${k}(${pts[k].join(', ')})$`).join(', ');
      const listA = keys.map((k) => `$${k} \\to (${proj(pts[k]).join(', ')})$`).join(', ');
      return { q: T(`A cuboid has one corner at the origin, with edges of length $${l}$ (along $x$), $${w}$ (along $y$) and $${h}$ (along $z$, vertically). Two of its vertices have coordinates ${listQ}. State the coordinates of the images of these two vertices under the orthogonal projection onto the plane used for ${view.name.en} (drop the coordinate that is collapsed).`, `Sebuah kuboid mempunyai satu bucu pada asalan, dengan tepi sepanjang $${l}$ (arah $x$), $${w}$ (arah $y$) dan $${h}$ (arah $z$, menegak). Dua daripada bucunya mempunyai koordinat ${listQ}. Nyatakan koordinat imej bagi kedua-dua bucu ini di bawah unjuran ortogon ke atas satah yang digunakan untuk ${view.name.ms} (gugurkan koordinat yang dimampatkan).`), a: T(listA, listA), w: W(DIMW, T(`${cap(view.name.en)} keeps the coordinates ${view.ax}, so the ${['$x$', '$y$', '$z$'][view.drop]} coordinate is dropped.`, `${cap(view.name.ms)} mengekalkan koordinat ${view.ax}, jadi koordinat ${['$x$', '$y$', '$z$'][view.drop]} digugurkan.`), listA), sp: 'm' };
    },
    // two different solids, same front elevation, different plan -> explain
    (r) => {
      const l = r.int(4, 7), w1 = r.int(2, 4), w2 = r.int(w1 + 1, w1 + 3), h = r.int(3, 6);
      return {
        q: T(`Solid $P$ is a cuboid $${l}$ cm by $${w1}$ cm by $${h}$ cm; solid $Q$ is a cuboid $${l}$ cm by $${w2}$ cm by $${h}$ cm (length by width by height). Explain whether $P$ and $Q$ can have identical front elevations (viewed along the width) while having different plans, and identify the two views for which this happens.`,
          `Pepejal $P$ ialah kuboid $${l}$ cm dengan $${w1}$ cm dengan $${h}$ cm; pepejal $Q$ ialah kuboid $${l}$ cm dengan $${w2}$ cm dengan $${h}$ cm (panjang dengan lebar dengan tinggi). Terangkan sama ada $P$ dan $Q$ boleh mempunyai dongakan depan yang sama (dilihat sepanjang lebar) sedangkan pelan mereka berbeza, dan kenal pasti dua paparan yang mengalami keadaan ini.`),
        a: T(`Yes. The front elevation only shows length and height, $${l}$ cm by $${h}$ cm for both $P$ and $Q$ (the width is collapsed), so the two front elevations are identical. Their plans, however, are $${l}$ cm by $${w1}$ cm and $${l}$ cm by $${w2}$ cm respectively, which differ since $${w1} \\neq ${w2}$. This shows a front elevation alone does not determine a solid uniquely; the plan is also needed.`,
          `Ya. Dongakan depan hanya menunjukkan panjang dan tinggi, $${l}$ cm dengan $${h}$ cm bagi kedua-dua $P$ dan $Q$ (lebar dimampatkan), jadi kedua-dua dongakan depan adalah sama. Walau bagaimanapun, pelan mereka ialah $${l}$ cm dengan $${w1}$ cm dan $${l}$ cm dengan $${w2}$ cm masing-masing, yang berbeza kerana $${w1} \\neq ${w2}$. Ini menunjukkan dongakan depan sahaja tidak menentukan sebuah pepejal secara unik; pelan juga diperlukan.`),
        w: W(DIMW, T(`Front elevations: both are $${l} \\times ${h}$ (the width is collapsed), so they are identical.`, `Dongakan depan: kedua-duanya $${l} \\times ${h}$ (lebar dimampatkan), jadi ia serupa.`), T(`Plans: $${l} \\times ${w1}$ and $${l} \\times ${w2}$, and $${w1} \\neq ${w2}$, so the plans differ.`, `Pelan: $${l} \\times ${w1}$ dan $${l} \\times ${w2}$, dan $${w1} \\neq ${w2}$, jadi pelan itu berbeza.`), T('So one view alone cannot determine a solid; the plan is needed as well.', 'Jadi satu paparan sahaja tidak dapat menentukan sebuah pepejal; pelan juga diperlukan.')),
        sp: 'm',
      };
    },
    // reasoning about a composite solid built from a height map: consistent solids sharing views
    (r) => {
      const { m, front, side } = heightMap(r, 2, 2, 1, 4);
      need(m[0][0] !== m[1][1] || m[0][1] !== m[1][0]);
      const swapped = [[m[1][1], m[1][0]], [m[0][1], m[0][0]]];
      const frontS = range(0, 1).map((j) => Math.max(...swapped.map((row) => row[j])));
      const sideS = range(0, 1).map((i) => Math.max(...swapped[i]));
      const sameViews = frontS.every((v, i) => v === front[i]) && sideS.every((v, i) => v === side[i]);
      const fig = planFig(m);
      return {
        q: T(`The plan shown gives the number of stacked unit cubes at each of the 4 positions in a $2 \\times 2$ arrangement. Swap the two cube-counts along each diagonal-opposite pair (i.e. rotate the four values by one position). State whether the front elevation and side elevation of the new arrangement are the same as those of the original, and explain why or why not.`,
          `Pelan yang ditunjukkan memberikan bilangan kiub unit yang ditindan pada setiap 4 kedudukan dalam susunan $2 \\times 2$. Tukar dua bilangan kiub di sepanjang setiap pasangan bertentangan menyerong (iaitu putarkan keempat-empat nilai sebanyak satu kedudukan). Nyatakan sama ada dongakan depan dan dongakan sisi susunan baharu adalah sama seperti susunan asal, dan terangkan mengapa.`),
        fig,
        a: sameViews
          ? T(`Yes, both elevations stay the same: each column's and row's maximum height is unchanged by this rotation, since the same set of heights still occupies each row and each column.`, `Ya, kedua-dua dongakan kekal sama: ketinggian maksimum setiap lajur dan baris tidak berubah oleh putaran ini, kerana set ketinggian yang sama masih menduduki setiap baris dan lajur.`)
          : T(`No, at least one elevation changes: the maximum height in some row or column is different after the rotation, because the tallest cube stack has moved to a different row or column.`, `Tidak, sekurang-kurangnya satu dongakan berubah: ketinggian maksimum dalam sesetengah baris atau lajur adalah berbeza selepas putaran, kerana tindanan kiub tertinggi telah berpindah ke baris atau lajur yang berbeza.`),
        w: W(T('The front elevation takes the tallest stack in each column; the side elevation takes the tallest stack in each row.', 'Dongakan depan mengambil timbunan tertinggi dalam setiap lajur; dongakan sisi mengambil timbunan tertinggi dalam setiap baris.'), T(`Original: front ${front.join(', ')}; side ${side.join(', ')}.`, `Asal: depan ${front.join(', ')}; sisi ${side.join(', ')}.`), T(`After the swap: front ${frontS.join(', ')}; side ${sideS.join(', ')}.`, `Selepas pertukaran: depan ${frontS.join(', ')}; sisi ${sideS.join(', ')}.`), sameViews ? T('Every column and row maximum is unchanged, so both elevations stay the same.', 'Setiap maksimum lajur dan baris tidak berubah, jadi kedua-dua dongakan kekal sama.') : T('At least one column or row maximum has moved, so at least one elevation is different.', 'Sekurang-kurangnya satu maksimum lajur atau baris telah berpindah, jadi sekurang-kurangnya satu dongakan berbeza.')),
        sp: 'l',
      };
    },
    // a: real-world scenario -> what else is needed to fully determine the 3D shape
    (r) => {
      const [c, v] = r.pick(M1_REALWORLD);
      const others = VIEWS.filter((x) => x.en !== v.en).map((x) => x.en).join(' and ');
      const othersMs = VIEWS.filter((x) => x.en !== v.en).map((x) => x.ms).join(' dan ');
      return { q: T(`Consider ${c.en}. This single drawing is only one orthogonal view of the object. Explain what information about the object's three-dimensional shape this view alone cannot determine, and name the other view(s) that would be needed.`, `Pertimbangkan ${c.ms}. Lukisan tunggal ini hanyalah satu paparan ortogon bagi objek itu. Terangkan maklumat tentang bentuk tiga dimensi objek itu yang tidak dapat ditentukan oleh paparan ini sahaja, dan namakan paparan lain yang diperlukan.`), a: T(`This view alone collapses one dimension, so it cannot show the depth profile along the viewing direction (e.g. changes of level or shape hidden behind the visible face); ${others} would be needed to determine the full three-dimensional shape.`, `Paparan ini sahaja memampatkan satu ukuran, jadi ia tidak dapat menunjukkan profil kedalaman sepanjang arah pandangan (contohnya perubahan aras atau bentuk yang tersembunyi di sebalik muka yang kelihatan); ${othersMs} diperlukan untuk menentukan bentuk tiga dimensi yang lengkap.`), w: W(DIMW, T(`This drawing is ${v.en}, so it shows only two dimensions; everything along the viewing direction is flattened onto one image.`, `Lukisan ini ialah ${v.ms}, jadi ia hanya menunjukkan dua ukuran; segala-galanya sepanjang arah pandangan diratakan menjadi satu imej.`), T(`To recover the missing dimension and the hidden profile, add ${others}.`, `Untuk mendapatkan semula ukuran yang hilang dan profil tersembunyi, tambahkan ${othersMs}.`)), sp: 'm' };
    },
    // a: explain (not just correct) why a student's statement is wrong, using the shown/lost-dimension property
    (r) => {
      const [wrong, fix] = r.pick(M1_ERRORS);
      return { q: T(`A student wrote: ${wrong.en} Using the property that each orthogonal view shows only two of a cuboid's three dimensions, explain fully why this statement is incorrect.`, `Seorang murid menulis: ${wrong.ms} Dengan menggunakan sifat bahawa setiap paparan ortogon hanya menunjukkan dua daripada tiga ukuran sebuah kuboid, terangkan sepenuhnya mengapa pernyataan ini tidak tepat.`), a: T(`It is incorrect because ${fix.en}, which follows from the fact that the projection direction for each view collapses exactly one of the three dimensions (length, width, height) and leaves the other two visible.`, `Ia tidak tepat kerana ${fix.ms}, yang berikutan daripada hakikat bahawa arah unjuran bagi setiap paparan memampatkan tepat satu daripada tiga ukuran (panjang, lebar, tinggi) dan membiarkan dua lagi kelihatan.`), w: W(DIMW, T(`Test the statement against that rule: ${fix.en}.`, `Uji pernyataan itu dengan hukum tersebut: ${fix.ms}.`), T('Each view collapses exactly one dimension, which is why the statement fails.', 'Setiap paparan memampatkan tepat satu ukuran, dan itulah sebabnya pernyataan itu gagal.')), sp: 'm' };
    },
    // a: full reasoning chain - derive the projection direction from the two dimensions that must be preserved
    (r) => {
      const f = r.pick(VFACTS);
      return { q: T(`A designer needs a single orthogonal drawing that preserves ${f.shown.en} of a cuboid exactly, accepting that ${f.lost.en} will not appear. Identify the view required, state its projection plane, and explain in terms of the projection direction why ${f.lost.en} is necessarily lost.`, `Seorang pereka memerlukan satu lukisan ortogon yang mengekalkan ${f.shown.ms} sebuah kuboid dengan tepat, dengan menerima bahawa ${f.lost.ms} tidak akan muncul. Kenal pasti paparan yang diperlukan, nyatakan satah unjurannya, dan terangkan dari segi arah unjuran mengapa ${f.lost.ms} pasti akan hilang.`), a: T(`${f.v.en[0].toUpperCase() + f.v.en.slice(1)}, on ${f.v.planeEn}. The projection rays run parallel to the direction of ${f.lost.en}, so every point along that direction maps to the same point on the plane, collapsing it to zero thickness in the image.`, `${f.v.ms[0].toUpperCase() + f.v.ms.slice(1)}, pada ${f.v.planeMs}. Sinar unjuran berjalan selari dengan arah ${f.lost.ms}, jadi setiap titik sepanjang arah itu terunjur pada titik yang sama pada satah, memampatkannya kepada ketebalan sifar dalam imej.`), w: W(DIMW, T(`The view that keeps ${f.shown.en} is ${f.v.en}, drawn on ${f.v.planeEn}.`, `Paparan yang mengekalkan ${f.shown.ms} ialah ${f.v.ms}, dilukis pada ${f.v.planeMs}.`), T(`Its rays run along ${f.lost.en}, so all points along that direction land on one image point and ${f.lost.en} is lost.`, `Sinarnya bergerak sepanjang ${f.lost.ms}, jadi semua titik pada arah itu jatuh pada satu titik imej dan ${f.lost.ms} hilang.`)), sp: 'l' };
    },
    // a: compare a genuine orthogonal case with a non-orthogonal case and explain the key difference
    (r) => {
      const trues = ORTHO_CASES.filter((c) => c[1]);
      const falses = ORTHO_CASES.filter((c) => !c[1]);
      const t = r.pick(trues), f = r.pick(falses);
      return { q: T(`Compare these two situations. (1) "${t[0].en}" (2) "${f[0].en}" Exactly one of them describes an orthogonal projection. Identify which one, and explain precisely what property the other situation fails to satisfy.`, `Bandingkan dua situasi ini. (1) "${t[0].ms}" (2) "${f[0].ms}" Tepat satu daripadanya menghuraikan unjuran ortogon. Kenal pasti yang mana satu, dan terangkan dengan tepat sifat yang gagal dipenuhi oleh situasi yang satu lagi.`), a: T(`Situation (1) is the orthogonal projection, because ${t[2].en}. Situation (2) is not, because ${f[2].en} — an orthogonal projection specifically requires rays that are parallel to one another AND perpendicular to the plane.`, `Situasi (1) ialah unjuran ortogon, kerana ${t[2].ms}. Situasi (2) bukan, kerana ${f[2].ms} — unjuran ortogon secara khusus memerlukan sinar yang selari antara satu sama lain DAN berserenjang dengan satah.`), w: W(ORTHW, T(`(1) satisfies both conditions: ${t[2].en}.`, `(1) memenuhi kedua-dua syarat: ${t[2].ms}.`), T(`(2) fails, because ${f[2].en}.`, `(2) gagal, kerana ${f[2].ms}.`), T('So (1) is the orthogonal projection.', 'Jadi (1) ialah unjuran ortogon.')), sp: 'm' };
    },
  ];

  SPM.extend('F3-7.1', { e: g1e, m: g1m, a: g1a });

  /* ================================================================ 7.2 Plans and elevations ================ */
  const SOLIDS = [
    { en: 'cylinder', ms: 'silinder', plan: T('a circle', 'bulatan'), front: T('a rectangle', 'segi empat tepat') },
    { en: 'cone', ms: 'kon', plan: T('a circle', 'bulatan'), front: T('a triangle', 'segi tiga') },
    { en: 'cuboid', ms: 'kuboid', plan: T('a rectangle', 'segi empat tepat'), front: T('a rectangle', 'segi empat tepat') },
    { en: 'cube', ms: 'kubus', plan: T('a square', 'segi empat sama'), front: T('a square', 'segi empat sama') },
    { en: 'square-based pyramid', ms: 'piramid tapak segi empat sama', plan: T('a square', 'segi empat sama'), front: T('a triangle', 'segi tiga') },
    { en: 'triangular prism, lying on a rectangular face', ms: 'prisma tegak tapak segi tiga, terbaring atas muka segi empat tepat', plan: T('a rectangle', 'segi empat tepat'), front: T('a triangle', 'segi tiga') },
    { en: 'sphere', ms: 'sfera', plan: T('a circle', 'bulatan'), front: T('a circle', 'bulatan') },
    { en: 'pentagonal prism, standing on its pentagonal face', ms: 'prisma tegak tapak pentagon, berdiri atas muka pentagonnya', plan: T('a pentagon', 'pentagon'), front: T('a rectangle', 'segi empat tepat') },
    { en: 'hexagonal-based pyramid', ms: 'piramid tapak heksagon', plan: T('a hexagon', 'heksagon'), front: T('a triangle', 'segi tiga') },
  ];

  const SHAPEW = T('The plan is what you see looking straight down; the front elevation is what you see looking horizontally at the front.', 'Pelan ialah apa yang dilihat memandang terus ke bawah; dongakan depan ialah apa yang dilihat secara mengufuk dari depan.');
  const CUBEW = T('For a cube-stack solid, each column of the front elevation is the tallest stack in that column of the plan, and each row of the side elevation is the tallest stack in that row.', 'Bagi pepejal timbunan kiub, setiap lajur dongakan depan ialah timbunan tertinggi dalam lajur pelan itu, dan setiap baris dongakan sisi ialah timbunan tertinggi dalam baris itu.');
  /** "3, 1 → 3; 2, 4 → 4" style line showing each column/row maximum */
  const maxLine = (groups, res) => groups.map((g, i) => `${g.join(', ')} → ${res[i]}`).join(';  ');
  const g2e = [
    // forward: name the plan and front-elevation shapes of a named solid
    (r) => {
      const s = r.pick(SOLIDS);
      return { q: T(`State the shape of the plan and the shape of the front elevation of a ${s.en}.`, `Nyatakan bentuk pelan dan bentuk dongakan depan bagi sebuah ${s.ms}.`), a: T(`Plan: ${s.plan.en}; front elevation: ${s.front.en}.`, `Pelan: ${s.plan.ms}; dongakan depan: ${s.front.ms}.`), w: W(SHAPEW, T(`Looking down on a ${s.en} gives ${s.plan.en}.`, `Memandang ke bawah pada ${s.ms} memberikan ${s.plan.ms}.`), T(`Looking at its front gives ${s.front.en}.`, `Memandang bahagian depannya memberikan ${s.front.ms}.`)), sp: 's' };
    },
    // reverse: name the solid from its plan + front elevation shapes
    (r) => {
      const s = r.pick(SOLIDS);
      return { q: T(`Which solid has a plan that is ${s.plan.en} and a front elevation that is ${s.front.en}?`, `Pepejal manakah yang mempunyai pelan berbentuk ${s.plan.ms} dan dongakan depan berbentuk ${s.front.ms}?`), a: T(s.en[0].toUpperCase() + s.en.slice(1), s.ms), w: W(SHAPEW, T(`A plan that is ${s.plan.en} fixes the shape of the base seen from above, and a front elevation that is ${s.front.en} fixes what it looks like from the front.`, `Pelan berbentuk ${s.plan.ms} menetapkan bentuk tapak yang dilihat dari atas, dan dongakan depan berbentuk ${s.front.ms} menetapkan rupanya dari depan.`), T(`Both fit a ${s.en}.`, `Kedua-duanya sepadan dengan ${s.ms}.`)), sp: 's' };
    },
    // draw the front elevation from a small plan (height map), numeric + figure
    (r) => {
      const { m, front } = heightMap(r, 2, 3);
      return { q: T('The plan shows a solid made of unit cubes; the number in each square is the number of cubes stacked there. State the height of each column of the front elevation (viewed from the bottom of the plan upward), from left to right.', 'Pelan menunjukkan pepejal yang dibina daripada kiub unit; nombor dalam setiap petak ialah bilangan kiub yang disusun di situ. Nyatakan ketinggian setiap lajur dongakan depan (dilihat dari bahagian bawah pelan ke atas), dari kiri ke kanan.'), fig: planFig(m), a: T(front.join(', '), front.join(', ')), w: W(CUBEW, T('Take the largest number in each column of the plan:', 'Ambil nombor terbesar dalam setiap lajur pelan:'), maxLine(front.map((_, j) => m.map((row) => row[j])), front), front.join(', ')), sp: 's' };
    },
    // draw the side elevation from a small plan (height map), numeric
    (r) => {
      const { m, side } = heightMap(r, 2, 3);
      return { q: T('The plan shows a solid made of unit cubes; the number in each square is the number of cubes stacked there. State the height of each row of the side elevation (viewed from the right of the plan), from top to bottom.', 'Pelan menunjukkan pepejal yang dibina daripada kiub unit; nombor dalam setiap petak ialah bilangan kiub yang disusun di situ. Nyatakan ketinggian setiap baris dongakan sisi (dilihat dari kanan pelan), dari atas ke bawah.'), fig: planFig(m), a: T(side.join(', '), side.join(', ')), w: W(CUBEW, T('Take the largest number in each row of the plan:', 'Ambil nombor terbesar dalam setiap baris pelan:'), maxLine(m.map((row) => row.slice()), side), side.join(', ')), sp: 's' };
    },
    // read plan dimensions off a labelled oblique cuboid sketch
    (r) => {
      const l = r.int(3, 8), d = r.int(2, 5), h = r.int(2, 6);
      need(l !== d);
      const fig = obliqBox(l, d, h, { labelL: `${l} cm`, labelD: `${d} cm`, labelH: `${h} cm` });
      return { q: T('The diagram shows a cuboid. State the dimensions of its plan.', 'Rajah menunjukkan sebuah kuboid. Nyatakan ukuran pelannya.'), fig, a: T(`${l} cm by ${d} cm`, `${l} cm dengan ${d} cm`), w: W(T('The plan is the view from directly above, so it shows the length and the depth; the height is collapsed.', 'Pelan ialah paparan terus dari atas, jadi ia menunjukkan panjang dan kedalaman; tinggi dimampatkan.'), T(`Plan $= ${l} \\times ${d}$ cm (the height $${h}$ cm does not appear).`, `Pelan $= ${l} \\times ${d}$ cm (tinggi $${h}$ cm tidak muncul).`)), sp: 's' };
    },
    // fill blank: elevation shape of a cuboid/prism standing upright
    (r) => ({ q: T('Fill in the blank: every face of a cuboid is a ________, so every one of its orthogonal views (plan and elevations) is also a rectangle (or a square).', 'Isi tempat kosong: setiap muka kuboid ialah ________, jadi setiap paparan ortogonnya (pelan dan dongakan) juga berbentuk segi empat tepat (atau segi empat sama).'), a: T('rectangle', 'segi empat tepat'), w: W(T('Every face of a cuboid is a rectangle, and each orthogonal view of it is the outline of one of those faces.', 'Setiap muka kuboid ialah segi empat tepat, dan setiap paparan ortogonnya ialah garis luar salah satu muka itu.'), T('So the blank is: rectangle.', 'Jadi tempat kosong itu ialah: segi empat tepat.')), sp: 'xs' }),
    // true/false: solid's plan shape
    (r) => {
      const s = r.pick(SOLIDS);
      const shapeStated = r.pick(SOLIDS).plan;
      const ans = shapeStated.en === s.plan.en;
      return { q: T(`True or false? The plan of a ${s.en} is ${shapeStated.en}.`, `Betul atau salah? Pelan sebuah ${s.ms} berbentuk ${shapeStated.ms}.`), a: ans ? T('True.', 'Betul.') : T(`False; its plan is ${s.plan.en}.`, `Salah; pelannya berbentuk ${s.plan.ms}.`), w: W(SHAPEW, T(`Seen from directly above, a ${s.en} gives ${s.plan.en}.`, `Dilihat terus dari atas, ${s.ms} memberikan ${s.plan.ms}.`), ans ? T('That is what the statement says, so it is true.', 'Itulah yang dinyatakan, jadi ia betul.') : T(`The statement says ${shapeStated.en}, so it is false.`, `Pernyataan itu menyebut ${shapeStated.ms}, jadi ia salah.`)), sp: 'xs' };
    },
  ];

  const g2m = [
    // pairwise compare: same plan shape but different front elevation? (or vice versa)
    (r) => {
      const [s1, s2] = r.sample(SOLIDS, 2);
      const byPlan = r.chance();
      const samePlan = s1.plan.en === s2.plan.en, sameFront = s1.front.en === s2.front.en;
      const claim = byPlan ? samePlan && !sameFront : sameFront && !samePlan;
      const q = byPlan
        ? T(`True or false? A ${s1.en} and a ${s2.en} have the same plan shape but different front elevations.`, `Betul atau salah? Sebuah ${s1.ms} dan sebuah ${s2.ms} mempunyai bentuk pelan yang sama tetapi dongakan depan yang berbeza.`)
        : T(`True or false? A ${s1.en} and a ${s2.en} have the same front elevation shape but different plans.`, `Betul atau salah? Sebuah ${s1.ms} dan sebuah ${s2.ms} mempunyai bentuk dongakan depan yang sama tetapi pelan yang berbeza.`);
      const cmp = T(`Plans: ${s1.plan.en} vs ${s2.plan.en} (${samePlan ? 'same' : 'different'}); front elevations: ${s1.front.en} vs ${s2.front.en} (${sameFront ? 'same' : 'different'}).`, `Pelan: ${s1.plan.ms} vs ${s2.plan.ms} (${samePlan ? 'sama' : 'berbeza'}); dongakan depan: ${s1.front.ms} vs ${s2.front.ms} (${sameFront ? 'sama' : 'berbeza'}).`);
      const a = claim
        ? T(`True. ${cmp.en}`, `Betul. ${cmp.ms}`)
        : T(`False. ${cmp.en}`, `Salah. ${cmp.ms}`);
      return { q, a, w: W(SHAPEW, cmp, claim ? T('Both parts of the claim hold, so it is true.', 'Kedua-dua bahagian dakwaan itu betul, jadi ia betul.') : T('At least one part of the claim fails, so it is false.', 'Sekurang-kurangnya satu bahagian dakwaan itu gagal, jadi ia salah.')), sp: 'm' };
    },
    // determine a missing dimension: cell forced to a unique value by its row and column maximum (brute-force verified)
    (r) => {
      const rows = 2, cols = 3, HI = 4;
      const { m, front, side } = heightMap(r, rows, cols, 1, HI);
      const i0 = r.int(0, rows - 1), j0 = r.int(0, cols - 1);
      const valid = [];
      for (let v = 1; v <= HI; v++) {
        const colOk = Math.max(v, ...m.map((row, i) => (i === i0 ? 0 : row[j0]))) === front[j0];
        const rowOk = Math.max(v, ...m[i0].map((x, j) => (j === j0 ? 0 : x))) === side[i0];
        if (colOk && rowOk) valid.push(v);
      }
      need(valid.length === 1); // forced: exactly one value is consistent with both elevations
      const shown = m.map((row, i) => row.map((v, j) => (i === i0 && j === j0 ? '?' : v)));
      const fig = gridFig(rows, cols, (i, j) => shown[i][j]);
      return { q: T(`The plan shows the number of cubes stacked at each position, except one position marked '?'. The front elevation has column heights ${front.join(', ')} and the side elevation has row heights ${side.join(', ')}. Find the number of cubes at the position marked '?'.`, `Pelan menunjukkan bilangan kiub yang disusun pada setiap kedudukan, kecuali satu kedudukan yang ditandakan '?'. Dongakan depan mempunyai ketinggian lajur ${front.join(', ')} dan dongakan sisi mempunyai ketinggian baris ${side.join(', ')}. Cari bilangan kiub pada kedudukan yang ditandakan '?'.`), fig, a: T(`${valid[0]} cubes (it is the only value that reaches both the column height ${front[j0]} and the row height ${side[i0]}).`, `${valid[0]} kiub (ia satu-satunya nilai yang mencapai kedua-dua ketinggian lajur ${front[j0]} dan ketinggian baris ${side[i0]}).`), w: W(CUBEW, T(`The column containing '?' must have tallest stack ${front[j0]}, and its row must have tallest stack ${side[i0]}.`, `Lajur yang mengandungi '?' mesti mempunyai timbunan tertinggi ${front[j0]}, dan barisnya mesti mempunyai timbunan tertinggi ${side[i0]}.`), T(`The other numbers already in that column and row do not reach both of these, so '?' must supply them: '?' $= ${valid[0]}$.`, `Nombor lain yang sudah ada dalam lajur dan baris itu tidak mencapai kedua-duanya, jadi '?' mesti membekalkannya: '?' $= ${valid[0]}$.`)), sp: 'm' };
    },
    // composite two-block solid: state the two-rectangle outline of the front elevation
    (r) => {
      const l1 = r.int(6, 9), l2 = r.int(2, 4), h1 = r.int(2, 3), h2 = r.int(2, 4), d = r.int(3, 6);
      need(l2 < l1);
      const fig = obliqBox(l1, d, h1 + h2, { labelL: `${l1} cm`, labelD: `${d} cm`, labelH: `${h1 + h2} cm` });
      return { q: T(`The solid shown is a base slab ${l1} cm long, ${d} cm deep and ${h1} cm high, with a smaller block ${l2} cm long centred on top, rising a further ${h2} cm (total height $${h1 + h2}$ cm). State the width and height of (a) the base slab's outline, (b) the top block's outline, as they appear on the front elevation.`, `Pepejal yang ditunjukkan ialah tapak sepanjang ${l1} cm, sedalam ${d} cm dan setinggi ${h1} cm, dengan sebuah blok lebih kecil sepanjang ${l2} cm di tengah di atasnya, naik lagi ${h2} cm (jumlah tinggi $${h1 + h2}$ cm). Nyatakan lebar dan tinggi bagi (a) garis luar tapak, (b) garis luar blok atas, seperti yang muncul pada dongakan depan.`), fig, a: T(`(a) ${l1} cm wide by ${h1} cm high (b) ${l2} cm wide by ${h2} cm high, centred on top of (a)`, `(a) lebar ${l1} cm, tinggi ${h1} cm (b) lebar ${l2} cm, tinggi ${h2} cm, di tengah atas (a)`), w: W(T('The front elevation shows length and height; the depth is collapsed, so each block contributes a rectangle of its own length and height.', 'Dongakan depan menunjukkan panjang dan tinggi; kedalaman dimampatkan, jadi setiap blok menyumbang satu segi empat tepat mengikut panjang dan tingginya sendiri.'), T(`(a) Base slab: $${l1} \\times ${h1}$ cm.`, `(a) Tapak: $${l1} \\times ${h1}$ cm.`), T(`(b) Top block: $${l2} \\times ${h2}$ cm, centred above the base outline (total height $${h1} + ${h2} = ${h1 + h2}$ cm).`, `(b) Blok atas: $${l2} \\times ${h2}$ cm, di tengah atas garis luar tapak (jumlah tinggi $${h1} + ${h2} = ${h1 + h2}$ cm).`)), sp: 'm' };
    },
    // given plan + front, find the side elevation dimensions/profile
    (r) => {
      const { m, front, side } = heightMap(r, 3, 3);
      return { q: T('The plan shows the number of cubes stacked at each position. Given that the front elevation (viewed from the bottom of the plan) has already been drawn correctly, find the column heights of the side elevation (viewed from the right), from top to bottom.', 'Pelan menunjukkan bilangan kiub yang disusun pada setiap kedudukan. Memandangkan dongakan depan (dilihat dari bahagian bawah pelan) telah dilukis dengan betul, cari ketinggian lajur dongakan sisi (dilihat dari kanan), dari atas ke bawah.'), fig: planFig(m), a: T(side.join(', '), side.join(', ')), w: W(CUBEW, T('The side elevation ignores the front elevation entirely: take the largest number in each row of the plan.', 'Dongakan sisi tidak bergantung langsung pada dongakan depan: ambil nombor terbesar dalam setiap baris pelan.'), maxLine(m.map((row) => row.slice()), side), side.join(', ')), sp: 'm' };
    },
  ];

  const g2a = [
    // pairwise compare: does plan + front elevation together distinguish these two solids?
    (r) => {
      const [s1, s2] = r.sample(SOLIDS, 2);
      const samePlan = s1.plan.en === s2.plan.en, sameFront = s1.front.en === s2.front.en;
      const distinguished = !samePlan || !sameFront;
      return { q: T(`Consider a ${s1.en} and a ${s2.en}. Compare their plans and their front elevations. Explain whether the plan together with the front elevation is enough to always tell the two solids apart; if not, describe what additional information would be needed.`, `Pertimbangkan sebuah ${s1.ms} dan sebuah ${s2.ms}. Bandingkan pelan dan dongakan depan mereka. Terangkan sama ada pelan bersama dongakan depan mencukupi untuk membezakan kedua-dua pepejal itu sentiasa; jika tidak, huraikan maklumat tambahan yang diperlukan.`), a: distinguished
        ? T(`Yes: plan of ${s1.en} is ${s1.plan.en} vs plan of ${s2.en} is ${s2.plan.en}; front elevation of ${s1.en} is ${s1.front.en} vs front elevation of ${s2.en} is ${s2.front.en}. At least one of these two views already differs, so together they distinguish the solids.`, `Ya: pelan ${s1.ms} ialah ${s1.plan.ms} berbanding pelan ${s2.ms} ialah ${s2.plan.ms}; dongakan depan ${s1.ms} ialah ${s1.front.ms} berbanding dongakan depan ${s2.ms} ialah ${s2.front.ms}. Sekurang-kurangnya satu daripada dua paparan ini sudah berbeza, jadi bersama-sama ia membezakan pepejal itu.`)
        : T(`No: both the plan (${s1.plan.en}) and the front elevation (${s1.front.en}) are identical for the two solids, so these two views alone cannot distinguish them; a side elevation, an actual measurement, or noting curved versus flat faces would be needed.`, `Tidak: kedua-dua pelan (${s1.plan.ms}) dan dongakan depan (${s1.front.ms}) adalah sama bagi kedua-dua pepejal, jadi kedua-dua paparan ini sahaja tidak dapat membezakan kedua-duanya; dongakan sisi, ukuran sebenar, atau catatan muka melengkung berbanding rata diperlukan.`), w: W(SHAPEW, T(`Plans: ${s1.plan.en} vs ${s2.plan.en}.`, `Pelan: ${s1.plan.ms} vs ${s2.plan.ms}.`), T(`Front elevations: ${s1.front.en} vs ${s2.front.en}.`, `Dongakan depan: ${s1.front.ms} vs ${s2.front.ms}.`), distinguished ? T('At least one pair differs, so the two views together already tell the solids apart.', 'Sekurang-kurangnya satu pasangan berbeza, jadi kedua-dua paparan bersama sudah membezakan pepejal itu.') : T('Both pairs match, so these two views cannot tell the solids apart; a third view or a measurement is needed.', 'Kedua-dua pasangan sepadan, jadi dua paparan ini tidak dapat membezakan pepejal itu; paparan ketiga atau ukuran diperlukan.')), sp: 'm' };
    },
    // full height-map puzzle: unique vs non-unique missing cell, justify (brute-force verified)
    (r) => {
      const rows = 2, cols = 3, HI = 4;
      const { m, front, side } = heightMap(r, rows, cols, 1, HI);
      const i0 = r.int(0, rows - 1), j0 = r.int(0, cols - 1);
      const valid = [];
      for (let v = 1; v <= HI; v++) {
        const colOk = Math.max(v, ...m.map((row, i) => (i === i0 ? 0 : row[j0]))) === front[j0];
        const rowOk = Math.max(v, ...m[i0].map((x, j) => (j === j0 ? 0 : x))) === side[i0];
        if (colOk && rowOk) valid.push(v);
      }
      need(valid.length >= 1);
      const shown = m.map((row, i) => row.map((v, j) => (i === i0 && j === j0 ? '?' : v)));
      const fig = gridFig(rows, cols, (i, j) => shown[i][j]);
      const uniq = valid.length === 1;
      return {
        q: T(`The plan shows the number of cubes at each position, except one marked '?'. Its front elevation has column heights ${front.join(', ')} and its side elevation has row heights ${side.join(', ')}. Determine whether the number of cubes at '?' is uniquely determined by these two elevations; find its value, or list every possible value, accordingly.`,
          `Pelan menunjukkan bilangan kiub pada setiap kedudukan, kecuali satu yang ditandakan '?'. Dongakan depannya mempunyai ketinggian lajur ${front.join(', ')} dan dongakan sisinya mempunyai ketinggian baris ${side.join(', ')}. Tentukan sama ada bilangan kiub pada '?' ditentukan secara unik oleh kedua-dua dongakan ini; cari nilainya, atau senaraikan setiap nilai yang mungkin, dengan sewajarnya.`),
        fig,
        a: uniq
          ? T(`Uniquely determined: '?' $= ${valid[0]}$ is the only value consistent with both elevations.`, `Ditentukan secara unik: '?' $= ${valid[0]}$ ialah satu-satunya nilai yang konsisten dengan kedua-dua dongakan.`)
          : T(`Not uniquely determined: '?' could be $${valid.join('$ or $')}$ without changing either elevation.`, `Tidak ditentukan secara unik: '?' boleh menjadi $${valid.join('$ atau $')}$ tanpa mengubah mana-mana dongakan.`),
        w: W(CUBEW, T(`The column containing '?' must reach ${front[j0]} and its row must reach ${side[i0]}.`, `Lajur yang mengandungi '?' mesti mencapai ${front[j0]} dan barisnya mesti mencapai ${side[i0]}.`), T(`Testing each possible count $1$ to ${HI} against both conditions leaves ${valid.join(', ')}.`, `Menguji setiap bilangan yang mungkin $1$ hingga ${HI} terhadap kedua-dua syarat meninggalkan ${valid.join(', ')}.`), uniq ? T('Exactly one value survives, so the count is uniquely determined.', 'Tepat satu nilai kekal, jadi bilangan itu ditentukan secara unik.') : T('More than one value survives, so the two elevations do not determine it.', 'Lebih daripada satu nilai kekal, jadi kedua-dua dongakan itu tidak menentukannya.')),
        sp: 'm',
      };
    },
    // reverse pairwise compare: does the plan alone distinguish these two solids?
    (r) => {
      const [s1, s2] = r.sample(SOLIDS, 2);
      const samePlan = s1.plan.en === s2.plan.en;
      return { q: T(`Consider a ${s1.en} and a ${s2.en}. Explain whether the plan alone is enough to tell the two solids apart, and justify your answer by comparing their plan shapes.`, `Pertimbangkan sebuah ${s1.ms} dan sebuah ${s2.ms}. Terangkan sama ada pelan sahaja mencukupi untuk membezakan kedua-dua pepejal ini, dan berikan justifikasi dengan membandingkan bentuk pelan mereka.`), a: !samePlan
        ? T(`Yes: the plan of a ${s1.en} is ${s1.plan.en} while that of a ${s2.en} is ${s2.plan.en}, so the plan alone already distinguishes them.`, `Ya: pelan ${s1.ms} ialah ${s1.plan.ms} manakala ${s2.ms} ialah ${s2.plan.ms}, jadi pelan sahaja sudah membezakan kedua-duanya.`)
        : T(`No: both have the same plan shape (${s1.plan.en}), so the plan alone cannot distinguish them; a front or side elevation, or an actual measurement, would be needed.`, `Tidak: kedua-duanya mempunyai bentuk pelan yang sama (${s1.plan.ms}), jadi pelan sahaja tidak dapat membezakan kedua-duanya; dongakan depan atau sisi, atau ukuran sebenar, diperlukan.`), w: W(SHAPEW, T(`Plan of a ${s1.en}: ${s1.plan.en}. Plan of a ${s2.en}: ${s2.plan.en}.`, `Pelan ${s1.ms}: ${s1.plan.ms}. Pelan ${s2.ms}: ${s2.plan.ms}.`), !samePlan ? T('The two plans differ, so the plan alone is enough.', 'Kedua-dua pelan berbeza, jadi pelan sahaja sudah memadai.') : T('The two plans are the same, so another view is needed.', 'Kedua-dua pelan sama, jadi paparan lain diperlukan.')), sp: 'm' };
    },
    // combine front + side outlines of a stepped solid to find its total footprint dimensions
    (r) => {
      const l1 = r.int(6, 9), l2 = r.int(2, 4), h1 = r.int(2, 3), h2 = r.int(2, 4), d = r.int(3, 6);
      need(l2 < l1);
      const fig = obliqBox(l1, d, h1 + h2, { labelL: `${l1} cm`, labelD: `${d} cm`, labelH: `${h1 + h2} cm` });
      return { q: T(`A stepped solid has a base slab and a smaller block on top (shown). Its front elevation shows a wide rectangle $${l1}$ cm by $${h1}$ cm with a narrower rectangle $${l2}$ cm by $${h2}$ cm centred above it. Its side elevation is a single rectangle $${d}$ cm wide. Using both elevations, state the overall length, depth and height of the solid, and explain which single view (plan, front, or side) alone would fail to reveal the change in level.`, `Sebuah pepejal berperingkat mempunyai tapak dan sebuah blok lebih kecil di atasnya (ditunjukkan). Dongakan depannya menunjukkan segi empat tepat lebar $${l1}$ cm dengan $${h1}$ cm dengan segi empat tepat lebih sempit $${l2}$ cm dengan $${h2}$ cm di tengah di atasnya. Dongakan sisinya ialah satu segi empat tepat sahaja selebar $${d}$ cm. Dengan menggunakan kedua-dua dongakan, nyatakan jumlah panjang, kedalaman dan tinggi pepejal itu, dan terangkan paparan tunggal (pelan, depan, atau sisi) yang sahaja gagal mendedahkan perubahan aras itu.`), fig, a: T(`Overall length $${l1}$ cm, depth $${d}$ cm, height $${h1 + h2}$ cm. The plan alone would fail: viewed from directly above, the top block's footprint lies inside the base slab's footprint, so the plan shows only a $${l1}$ cm by $${d}$ cm rectangle with no sign of the step in height.`, `Jumlah panjang $${l1}$ cm, kedalaman $${d}$ cm, tinggi $${h1 + h2}$ cm. Pelan sahaja akan gagal: dilihat terus dari atas, tapak blok atas terletak di dalam tapak tapak bawah, jadi pelan hanya menunjukkan segi empat tepat $${l1}$ cm dengan $${d}$ cm tanpa sebarang tanda perubahan aras.`), w: W(T('Read one dimension from each view: the front elevation gives the length and the total height, the side elevation gives the depth.', 'Baca satu ukuran daripada setiap paparan: dongakan depan memberikan panjang dan jumlah tinggi, dongakan sisi memberikan kedalaman.'), T(`Length $= ${l1}$ cm; height $= ${h1} + ${h2} = ${h1 + h2}$ cm; depth $= ${d}$ cm.`, `Panjang $= ${l1}$ cm; tinggi $= ${h1} + ${h2} = ${h1 + h2}$ cm; kedalaman $= ${d}$ cm.`), T(`The plan is the view that fails: looking down, the top block sits inside the base outline, so the plan is only a $${l1} \\times ${d}$ cm rectangle and the step in height is invisible.`, `Pelan ialah paparan yang gagal: memandang ke bawah, blok atas berada di dalam garis luar tapak, jadi pelan hanyalah segi empat tepat $${l1} \\times ${d}$ cm dan perubahan aras tidak kelihatan.`)), sp: 'l' };
    },
  ];

  SPM.extend('F3-7.2', { e: g2e, m: g2m, a: g2a });

  /* ================================================================ 7.3 Drawings to scale ==================== */
  const SCALES = [2, 4, 5, 10, 20, 25, 50, 100, 200, 500];
  const CL = T('construction line', 'garis binaan');
  /* objects with a realistic actual unit, and its conversion factor to cm (so context also varies the maths, not just the noun) */
  const CTXU = [
    { obj: T('a toy car', 'kereta mainan'), unit: 'mm', f: 0.1 },
    { obj: T('a key', 'anak kunci'), unit: 'mm', f: 0.1 },
    { obj: T('a garden wall', 'dinding taman'), unit: 'cm', f: 1 },
    { obj: T('a wardrobe', 'almari pakaian'), unit: 'cm', f: 1 },
    { obj: T('a classroom', 'bilik darjah'), unit: 'm', f: 100 },
    { obj: T('a school building', 'bangunan sekolah'), unit: 'm', f: 100 },
    { obj: T('a football field', 'padang bola sepak'), unit: 'm', f: 100 },
    { obj: T('a bridge', 'jambatan'), unit: 'm', f: 100 },
    { obj: T('a road between two towns', 'jalan antara dua bandar'), unit: 'km', f: 100000 },
    { obj: T('a river shown on a map', 'sungai yang ditunjukkan pada peta'), unit: 'km', f: 100000 },
    { obj: T('a mobile phone', 'telefon bimbit'), unit: 'mm', f: 0.1 },
    { obj: T('a pencil case', 'kotak pensel'), unit: 'cm', f: 1 },
    { obj: T('a swimming pool', 'kolam renang'), unit: 'm', f: 100 },
    { obj: T('a hiking trail', 'laluan mendaki'), unit: 'km', f: 100000 },
    { obj: T('a bookshelf', 'rak buku'), unit: 'cm', f: 1 },
  ];
  const SCALE_ERRORS = [
    [T('"A scale of $1 : 100$ produces a bigger drawing than a scale of $1 : 20$."', '"Skala $1 : 100$ menghasilkan lukisan yang lebih besar daripada skala $1 : 20$."'), T('the SMALLER the ratio $n$ in $1:n$, the bigger the drawing, so $1:20$ gives the bigger drawing, not $1:100$', 'semakin KECIL nisbah $n$ dalam $1:n$, semakin besar lukisan, jadi $1:20$ memberikan lukisan yang lebih besar, bukan $1:100$')],
    [T('"To find the actual length from a scale of $1 : n$, divide the drawn length by $n$."', '"Untuk mencari panjang sebenar daripada skala $1 : n$, bahagikan panjang lukisan dengan $n$."'), T('the drawn length should be MULTIPLIED by $n$ to get the actual length, not divided', 'panjang lukisan patut DIDARABKAN dengan $n$ untuk mendapat panjang sebenar, bukan dibahagikan')],
    [T('"A scale of $1 : 1$ means the drawing is drawn ten times larger than the actual object."', '"Skala $1 : 1$ bermaksud lukisan dilukis sepuluh kali lebih besar daripada objek sebenar."'), T('a scale of $1:1$ means the drawing is the SAME size as the actual object', 'skala $1:1$ bermaksud lukisan itu SAMA saiz dengan objek sebenar')],
    [T('"On a scale drawing, the plan and the front elevation can be drawn using two different scales, as long as both are labelled."', '"Pada suatu lukisan berskala, pelan dan dongakan depan boleh dilukis menggunakan dua skala yang berbeza, asalkan kedua-duanya dilabel."'), T('every view of the same object in one set of drawings must use the SAME scale, otherwise corresponding lengths will not agree', 'setiap paparan bagi objek yang sama dalam satu set lukisan mesti menggunakan skala yang SAMA, jika tidak panjang yang sepadan tidak akan bersetuju')],
    [T('"A construction line is part of the final, emphasised outline of a scale drawing."', '"Garis binaan ialah sebahagian daripada garis luar akhir yang ditebalkan pada suatu lukisan berskala."'), T('a construction line is a light guide line used only to set out or align the drawing; it is NOT part of the final emphasised outline', 'garis binaan ialah garis panduan nipis yang hanya digunakan untuk menyediakan atau menjajarkan lukisan; ia BUKAN sebahagian daripada garis luar akhir yang ditebalkan')],
    [T('"A scale written as $1 : 50$ means the actual object is 50 cm long, regardless of the drawing."', '"Skala yang ditulis sebagai $1 : 50$ bermaksud objek sebenar panjangnya 50 cm, tanpa mengira lukisan."'), T('$1:50$ is a RATIO (every 1 unit on the drawing represents 50 of the same unit in reality); it does not by itself state any actual length', '$1:50$ ialah suatu NISBAH (setiap 1 unit pada lukisan mewakili 50 unit yang sama jenis dalam realiti); ia sendiri tidak menyatakan sebarang panjang sebenar')],
    [T('"Increasing the scale ratio $n$ (for example from $1:20$ to $1:50$) makes the drawing larger."', '"Menambah nisbah skala $n$ (contohnya daripada $1:20$ kepada $1:50$) menjadikan lukisan lebih besar."'), T('increasing $n$ makes the drawing SMALLER, since each drawn unit then represents more actual units', 'menambah $n$ menjadikan lukisan lebih KECIL, kerana setiap unit lukisan mewakili lebih banyak unit sebenar')],
    [T('"A scale drawing must always be smaller than the actual object."', '"Suatu lukisan berskala mestilah sentiasa lebih kecil daripada objek sebenar."'), T('a scale can also ENLARGE the object (e.g. $1:1$ for the same size, or scales like $n:1$ for a magnified drawing of a small object); "scale drawing" does not always mean a reduction', 'suatu skala juga boleh MEMBESARKAN objek (contohnya $1:1$ untuk saiz yang sama, atau skala seperti $n:1$ untuk lukisan yang dibesarkan bagi objek kecil); "lukisan berskala" tidak semestinya bermaksud pengecilan')],
    [T('"If a plan and a front elevation of the same object use the same scale, their drawn heights must also be equal."', '"Jika pelan dan dongakan depan bagi objek yang sama menggunakan skala yang sama, tinggi lukisan kedua-duanya mesti sama."'), T('a plan has no height at all (it shows length and width only); it is the shared LENGTH, not the height, that must agree between a plan and a front elevation', 'pelan langsung tiada tinggi (ia hanya menunjukkan panjang dan lebar); PANJANG yang dikongsi, bukan tinggi, yang mesti sepadan antara pelan dan dongakan depan')],
  ];

  const SCALEW = T('With a scale of $1 : n$: actual length $\\div\\, n =$ drawn length, and drawn length $\\times\\, n =$ actual length (both in the same unit).', 'Dengan skala $1 : n$: panjang sebenar $\\div\\, n =$ panjang lukisan, dan panjang lukisan $\\times\\, n =$ panjang sebenar (kedua-duanya dalam unit yang sama).');
  /** is an actual size realistic for this object's unit? (mm/cm/m/km) */
  const okV = (V, c) => (c.f === 0.1 ? V <= 300 : c.f === 1 ? V <= 400 : c.f === 100 ? V <= 200 : V <= 50);
  /** unit conversion line, omitted when the object's unit is already cm */
  const convLine = (V, c) => (c.f === 1 ? [] : [T(`$${SPM.n(V)}\\ \\text{${c.unit}} = ${SPM.n(V * c.f)}\\ \\text{cm}$`, `$${SPM.n(V)}\\ \\text{${c.unit}} = ${SPM.n(V * c.f)}\\ \\text{cm}$`)]);
  const g3e = [
    // actual -> drawing length, crossed with realistic contexts/units
    (r) => {
      const c = r.pick(CTXU), k = r.pick(SCALES), V = r.int(2, 9);
      const d = (V * c.f) / k;
      need(Number.isInteger(d * 10) && d >= 0.2 && d <= 40 && okV(V, c));
      return { q: T(`${SPM.cap(c.obj.en)} is ${V} ${c.unit} long in reality. It is drawn to a scale of $1 : ${k}$. Find its length on the drawing, in cm.`, `${SPM.cap(c.obj.ms)} panjangnya ${V} ${c.unit} sebenarnya. Ia dilukis dengan skala $1 : ${k}$. Cari panjangnya pada lukisan, dalam cm.`), a: T(`${SPM.n(d)} cm`), w: W(SCALEW, ...convLine(V, c), `$${SPM.n(V * c.f)} \\div ${k} = ${SPM.n(d)}$ cm`), sp: 's' };
    },
    // drawing -> actual length, crossed with realistic contexts/units
    (r) => {
      const c = r.pick(CTXU), k = r.pick(SCALES), d = r.int(2, 9);
      const actualCm = d * k, V = actualCm / c.f;
      need(Number.isInteger(V * 10) && V > 0 && okV(V, c));
      return { q: T(`${SPM.cap(c.obj.en)} is drawn ${d} cm long on a scale drawing with a scale of $1 : ${k}$. Find its actual length, in ${c.unit}.`, `${SPM.cap(c.obj.ms)} dilukis sepanjang ${d} cm pada suatu lukisan berskala dengan skala $1 : ${k}$. Cari panjang sebenarnya, dalam ${c.unit}.`), a: T(`${SPM.n(V)} ${c.unit}`), w: W(SCALEW, `$${d} \\times ${k} = ${SPM.n(actualCm)}$ cm`, ...(c.f === 1 ? [] : [T(`$${SPM.n(actualCm)}\\ \\text{cm} = ${SPM.n(V)}\\ \\text{${c.unit}}$`, `$${SPM.n(actualCm)}\\ \\text{cm} = ${SPM.n(V)}\\ \\text{${c.unit}}$`)])), sp: 's' };
    },
    // find the scale ratio from actual and drawing lengths, crossed with contexts/units
    (r) => {
      const c = r.pick(CTXU), k = r.pick(SCALES), d = r.int(2, 9);
      const actualCm = d * k, V = actualCm / c.f;
      need(Number.isInteger(V * 10) && V > 0 && okV(V, c));
      return { q: T(`${SPM.cap(c.obj.en)}, ${SPM.n(V)} ${c.unit} long in reality, is drawn as ${d} cm on a scale drawing. State the scale used, in the form $1 : n$.`, `${SPM.cap(c.obj.ms)}, sepanjang ${SPM.n(V)} ${c.unit} sebenarnya, dilukis sepanjang ${d} cm pada suatu lukisan berskala. Nyatakan skala yang digunakan, dalam bentuk $1 : n$.`), w: W(T('Write both lengths in the same unit, then divide the actual length by the drawn length.', 'Tulis kedua-dua panjang dalam unit yang sama, kemudian bahagikan panjang sebenar dengan panjang lukisan.'), ...convLine(V, c), `$${SPM.n(actualCm)} \\div ${d} = ${k}$`, `$1 : ${k}$`), a: T(`$1 : ${k}$`), sp: 's' };
    },
    // pairwise: which of two scales gives the larger drawing
    (r) => {
      const [k1, k2] = r.sample(SCALES, 2);
      const bigger = Math.min(k1, k2);
      return { q: T(`For the same actual length, which scale produces a larger drawing: $1 : ${k1}$ or $1 : ${k2}$?`, `Bagi panjang sebenar yang sama, skala manakah menghasilkan lukisan yang lebih besar: $1 : ${k1}$ atau $1 : ${k2}$?`), a: T(`$1 : ${bigger}$ (the smaller the ratio $n$, the larger the drawing)`, `$1 : ${bigger}$ (semakin kecil nisbah $n$, semakin besar lukisan)`), w: W(SCALEW, T('The same actual length is divided by $n$, so a smaller $n$ leaves a longer drawn length.', 'Panjang sebenar yang sama dibahagikan dengan $n$, jadi $n$ yang lebih kecil meninggalkan panjang lukisan yang lebih panjang.'), `$${bigger} \\lt ${Math.max(k1, k2)}$`, `$1 : ${bigger}$`), sp: 's' };
    },
    // conceptual fill blank
    (r) => ({ q: T('Fill in the blank: a scale of $1 : n$ means that each unit of length on the drawing represents ________ units of the same kind in reality.', 'Isi tempat kosong: skala $1 : n$ bermaksud setiap unit panjang pada lukisan mewakili ________ unit sebenar yang sama jenis.'), a: T('$n$'), w: W(SCALEW, T('So $1$ unit on the drawing stands for $n$ units in reality.', 'Jadi $1$ unit pada lukisan mewakili $n$ unit sebenar.')), sp: 'xs' }),
    // true/false about scale size
    (r) => {
      const [k1, k2] = r.sample(SCALES, 2);
      const claim = k1 < k2; // claim: scale 1:k1 gives a larger drawing than 1:k2
      return { q: T(`True or false? A scale of $1 : ${k1}$ produces a larger drawing than a scale of $1 : ${k2}$, for the same actual length.`, `Betul atau salah? Skala $1 : ${k1}$ menghasilkan lukisan yang lebih besar berbanding skala $1 : ${k2}$, bagi panjang sebenar yang sama.`), a: claim ? T('True.', 'Betul.') : T('False.', 'Salah.'), w: W(SCALEW, `$${k1} ${k1 < k2 ? '\\lt' : '\\gt'} ${k2}$`, claim ? T(`Dividing by the smaller number $${k1}$ leaves the longer drawing, so the statement is true.`, `Membahagi dengan nombor yang lebih kecil $${k1}$ meninggalkan lukisan yang lebih panjang, jadi penyataan itu betul.`) : T(`Dividing by the larger number $${k1}$ leaves the shorter drawing, so the statement is false.`, `Membahagi dengan nombor yang lebih besar $${k1}$ meninggalkan lukisan yang lebih pendek, jadi penyataan itu salah.`)), sp: 'xs' };
    },
    // unit conversion before applying scale
    (r) => {
      const k = r.pick(SCALES), Lm = r.int(2, 9);
      return { q: T(`A wall is ${Lm} m long. It is drawn to a scale of $1 : ${k}$. Find the length of the wall on the drawing, in cm.`, `Sebuah dinding panjangnya ${Lm} m. Ia dilukis dengan skala $1 : ${k}$. Cari panjang dinding itu pada lukisan, dalam cm.`), a: T(`${SPM.n((Lm * 100) / k)} cm`), w: W(SCALEW, T('Convert to the same unit first:', 'Tukar kepada unit yang sama dahulu:'), `$${Lm}\\ \\text{m} = ${Lm * 100}\\ \\text{cm}$`, `$${Lm * 100} \\div ${k} = ${SPM.n((Lm * 100) / k)}$ cm`), sp: 's' };
    },
    // what a construction line is for (conceptual recall)
    (r) => ({ q: T(`What is the purpose of a ${CL.en} in a scale drawing?`, `Apakah tujuan sebuah ${CL.ms} dalam suatu lukisan berskala?`), a: T('To lightly transfer or align a dimension from one view to another (or to set out a drawing) before the final outline is emphasised; it is not part of the final visible outline.', 'Untuk memindahkan atau menjajarkan ukuran secara nipis daripada satu paparan ke paparan lain (atau untuk menyediakan lukisan) sebelum garis luar akhir ditebalkan; ia bukan sebahagian daripada garis luar akhir yang kelihatan.'), w: W(T('Views of the same object must line up, so corresponding points are carried from one view to the next with light guide lines.', 'Paparan bagi objek yang sama mesti sejajar, jadi titik yang sepadan dibawa dari satu paparan ke paparan seterusnya dengan garis panduan yang nipis.'), T('Those guide lines are the construction lines; they are left faint or erased, and only the final outline is emphasised.', 'Garis panduan itulah garis binaan; ia dibiarkan nipis atau dipadamkan, dan hanya garis luar akhir ditebalkan.')), sp: 's' }),
  ];

  const g3m = [
    // find drawing length AND width for a plan, given actual dims and scale
    (r) => {
      const k = r.pick(SCALES), l = r.int(2, 9) * k, w = r.int(2, 9) * k;
      need(l !== w);
      return { q: T(`A rectangular room ${l} cm by ${w} cm is drawn to a scale of $1 : ${k}$. Find the length and width of the room on the plan.`, `Sebuah bilik segi empat tepat berukuran ${l} cm dengan ${w} cm dilukis dengan skala $1 : ${k}$. Cari panjang dan lebar bilik itu pada pelan.`), a: T(`${l / k} cm by ${w / k} cm`), w: W(SCALEW, `$${l} \\div ${k} = ${l / k}$ cm`, `$${w} \\div ${k} = ${w / k}$ cm`), sp: 's' };
    },
    // two-step: find the scale, then use it to find another actual length
    (r) => {
      const k = r.pick(SCALES), d1 = r.int(2, 6), L1 = d1 * k, d2 = r.int(2, 9);
      need(d1 !== d2);
      return { q: T(`On a scale drawing, an actual length of ${L1} cm is drawn as ${d1} cm. A different part of the same drawing measures ${d2} cm. Find the actual length this represents.`, `Pada suatu lukisan berskala, panjang sebenar ${L1} cm dilukis sebagai ${d1} cm. Satu bahagian lain pada lukisan yang sama berukuran ${d2} cm. Cari panjang sebenar yang diwakilinya.`), a: T(`${d2 * k} cm (scale is $1 : ${k}$)`, `${d2 * k} cm (skala ialah $1 : ${k}$)`), w: W(T('First find the scale from the pair of lengths that is given completely.', 'Cari skala dahulu daripada pasangan panjang yang diberi lengkap.'), `$${L1} \\div ${d1} = ${k}$, $1 : ${k}$`, T('Then use it on the other drawn length:', 'Kemudian gunakannya pada panjang lukisan yang satu lagi:'), `$${d2} \\times ${k} = ${d2 * k}$ cm`), sp: 's' };
    },
    // consistency check: plan and front elevation drawn at the same scale must share the length
    (r) => {
      const k = r.pick(SCALES), l = r.int(3, 8) * k, w = r.int(2, 6) * k, h = r.int(2, 6) * k;
      need(l !== w && l !== h);
      const bad = r.chance();
      const wrongL = l + k * r.pick([-2, -1, 1, 2]);
      need(wrongL > 0 && wrongL !== l);
      const shownFrontL = bad ? wrongL : l;
      return { q: T(`A cuboid room is drawn to a scale of $1 : ${k}$. Its plan measures ${l / k} cm by ${w / k} cm. Its front elevation measures ${shownFrontL / k} cm by ${h / k} cm. Are these two drawings consistent with the same scale and the same room? Explain.`, `Sebuah bilik berbentuk kuboid dilukis dengan skala $1 : ${k}$. Pelannya berukuran ${l / k} cm dengan ${w / k} cm. Dongakan depannya berukuran ${shownFrontL / k} cm dengan ${h / k} cm. Adakah kedua-dua lukisan ini konsisten dengan skala dan bilik yang sama? Terangkan.`), a: bad
        ? T(`No. The plan and front elevation must share the same drawn length; here ${l / k} cm (plan) $\\neq$ ${shownFrontL / k} cm (front elevation).`, `Tidak. Pelan dan dongakan depan mesti berkongsi panjang lukisan yang sama; di sini ${l / k} cm (pelan) $\\neq$ ${shownFrontL / k} cm (dongakan depan).`)
        : T(`Yes. Both drawings show the same length, ${l / k} cm, so they are consistent.`, `Ya. Kedua-dua lukisan menunjukkan panjang yang sama, ${l / k} cm, jadi kedua-duanya konsisten.`), w: W(T('A plan and a front elevation of the same object share the length, so at one scale that drawn length must be the same in both.', 'Pelan dan dongakan depan bagi objek yang sama berkongsi panjang, jadi pada satu skala, panjang lukisan itu mesti sama dalam kedua-duanya.'), `$\\text{plan}: ${l / k}$ cm`, `$\\text{front}: ${shownFrontL / k}$ cm`, bad ? T(`$${l / k} \\neq ${shownFrontL / k}$, so the drawings are not consistent (the actual lengths would be $${l}$ cm and $${shownFrontL}$ cm).`, `$${l / k} \\neq ${shownFrontL / k}$, jadi lukisan itu tidak konsisten (panjang sebenarnya ialah $${l}$ cm dan $${shownFrontL}$ cm).`) : T(`$${l / k} = ${shownFrontL / k}$, so the drawings are consistent.`, `$${l / k} = ${shownFrontL / k}$, jadi lukisan itu konsisten.`)), sp: 'm' };
    },
    // pairwise scale comparison with actual numeric drawing lengths
    (r) => {
      const [k1, k2] = r.sample(SCALES, 2);
      const L = r.int(2, 9) * k1 * k2;
      return { q: T(`An actual length of ${L} cm is drawn once at a scale of $1 : ${k1}$ and once at a scale of $1 : ${k2}$. Find both drawing lengths, and state which scale gives the longer drawing.`, `Panjang sebenar ${L} cm dilukis sekali dengan skala $1 : ${k1}$ dan sekali dengan skala $1 : ${k2}$. Cari kedua-dua panjang lukisan, dan nyatakan skala yang memberikan lukisan yang lebih panjang.`), a: T(`$1 : ${k1}$ gives ${L / k1} cm; $1 : ${k2}$ gives ${L / k2} cm. $1 : ${Math.min(k1, k2)}$ gives the longer drawing.`, `$1 : ${k1}$ memberikan ${L / k1} cm; $1 : ${k2}$ memberikan ${L / k2} cm. $1 : ${Math.min(k1, k2)}$ memberikan lukisan yang lebih panjang.`), w: W(SCALEW, `$${L} \\div ${k1} = ${L / k1}$ cm`, `$${L} \\div ${k2} = ${L / k2}$ cm`, T(`The smaller $n$, $${Math.min(k1, k2)}$, gives the longer drawing.`, `Nilai $n$ yang lebih kecil, $${Math.min(k1, k2)}$, memberikan lukisan yang lebih panjang.`)), sp: 'm' };
    },
    // area-free perimeter task: find the drawn perimeter of a rectangle from actual dims and scale
    (r) => {
      const k = r.pick(SCALES), l = r.int(3, 9) * k, w = r.int(2, 6) * k;
      need(l !== w);
      return { q: T(`A rectangular plot ${l} cm by ${w} cm is drawn to a scale of $1 : ${k}$. Find the perimeter of the plot as it appears on the drawing.`, `Sebidang tanah segi empat tepat berukuran ${l} cm dengan ${w} cm dilukis dengan skala $1 : ${k}$. Cari perimeter tanah itu seperti yang terlukis.`), a: T(`${2 * (l / k + w / k)} cm`), w: W(SCALEW, `$${l} \\div ${k} = ${l / k}$ cm`, `$${w} \\div ${k} = ${w / k}$ cm`, T('Perimeter of the drawn rectangle:', 'Perimeter segi empat tepat yang dilukis:'), `$2 \\times (${l / k} + ${w / k}) = ${2 * (l / k + w / k)}$ cm`), sp: 's' };
    },
    // spot and correct the error in a student's statement about scale
    (r) => {
      const [wrong, fix] = r.pick(SCALE_ERRORS);
      return { q: T(`A student wrote the statement: ${wrong.en} Identify the error and correct it.`, `Seorang murid menulis pernyataan: ${wrong.ms} Kenal pasti kesilapan itu dan betulkannya.`), a: T(`Error: ${fix.en}.`, `Kesilapan: ${fix.ms}.`), w: W(SCALEW, T(`Checking the statement against this rule: ${fix.en}.`, `Menyemak pernyataan itu dengan hukum ini: ${fix.ms}.`)), sp: 's' };
    },
    // two-length ratio: find both drawn lengths for two different actual lengths at the same scale, crossed with context
    (r) => {
      const c = r.pick(CTXU), k = r.pick(SCALES), V1 = r.int(2, 9), V2 = r.int(2, 9);
      need(V1 !== V2);
      const d1 = (V1 * c.f) / k, d2 = (V2 * c.f) / k;
      need(Number.isInteger(d1 * 10) && Number.isInteger(d2 * 10) && d1 >= 0.2 && d2 >= 0.2 && d1 <= 40 && d2 <= 40);
      return { q: T(`Two parts of ${c.obj.en} measure ${V1} ${c.unit} and ${V2} ${c.unit} in reality. Both are drawn to the same scale of $1 : ${k}$. Find the difference between their two drawn lengths, in cm.`, `Dua bahagian ${c.obj.ms} berukuran ${V1} ${c.unit} dan ${V2} ${c.unit} sebenarnya. Kedua-duanya dilukis dengan skala yang sama, $1 : ${k}$. Cari beza antara kedua-dua panjang lukisannya, dalam cm.`), a: T(`${SPM.n(Math.abs(d1 - d2))} cm`), w: W(SCALEW, ...convLine(V1, c), `$${SPM.n(V1 * c.f)} \\div ${k} = ${SPM.n(d1)}$ cm`, `$${SPM.n(V2 * c.f)} \\div ${k} = ${SPM.n(d2)}$ cm`, `$${SPM.n(Math.max(d1, d2))} - ${SPM.n(Math.min(d1, d2))} = ${SPM.n(Math.abs(d1 - d2))}$ cm`), sp: 's' };
    },
    // pairwise: compare drawn lengths of two DIFFERENT objects at the same scale
    (r) => {
      const [c1, c2] = r.sample(CTXU, 2);
      const k = r.pick(SCALES), V1 = r.int(2, 9), V2 = r.int(2, 9);
      const d1 = (V1 * c1.f) / k, d2 = (V2 * c2.f) / k;
      need(Number.isInteger(d1 * 10) && Number.isInteger(d2 * 10) && d1 >= 0.2 && d2 >= 0.2 && d1 <= 40 && d2 <= 40 && d1 !== d2);
      const longer = d1 > d2 ? c1 : c2;
      return { q: T(`${SPM.cap(c1.obj.en)} is ${V1} ${c1.unit} long, and ${c2.obj.en} is ${V2} ${c2.unit} long, in reality. Both are drawn on the same page at a scale of $1 : ${k}$. Find both drawn lengths, in cm, and state which drawing is longer.`, `${SPM.cap(c1.obj.ms)} panjangnya ${V1} ${c1.unit}, dan ${c2.obj.ms} panjangnya ${V2} ${c2.unit}, sebenarnya. Kedua-duanya dilukis pada helaian yang sama dengan skala $1 : ${k}$. Cari kedua-dua panjang lukisan, dalam cm, dan nyatakan lukisan manakah yang lebih panjang.`), a: T(`${c1.obj.en}: ${SPM.n(d1)} cm; ${c2.obj.en}: ${SPM.n(d2)} cm. The drawing of ${longer.obj.en} is longer.`, `${c1.obj.ms}: ${SPM.n(d1)} cm; ${c2.obj.ms}: ${SPM.n(d2)} cm. Lukisan ${longer.obj.ms} lebih panjang.`), w: W(SCALEW, T('Convert each actual length to cm, then divide by the scale factor.', 'Tukar setiap panjang sebenar kepada cm, kemudian bahagikan dengan faktor skala.'), `$${SPM.n(V1 * c1.f)} \\div ${k} = ${SPM.n(d1)}$ cm`, `$${SPM.n(V2 * c2.f)} \\div ${k} = ${SPM.n(d2)}$ cm`, T(`$${SPM.n(Math.max(d1, d2))} \\gt ${SPM.n(Math.min(d1, d2))}$, so the drawing of ${longer.obj.en} is longer.`, `$${SPM.n(Math.max(d1, d2))} \\gt ${SPM.n(Math.min(d1, d2))}$, jadi lukisan ${longer.obj.ms} lebih panjang.`)), sp: 'm' };
    },
  ];

  const g3a = [
    // multi-step: full plan+elevation drawing dims from 3D size, check they fit a paper limit
    (r) => {
      const k = r.pick(SCALES), l = r.int(4, 9) * k, w = r.int(2, 6) * k, h = r.int(2, 6) * k;
      need(l !== w && l !== h);
      const paper = r.pick([15, 20, 25, 30]);
      const planL = l / k, planW = w / k, frontH = h / k;
      const fits = planL <= paper && planW <= paper && frontH <= paper;
      return { q: T(`A room ${l} cm long, ${w} cm wide and ${h} cm high is to be drawn to a scale of $1 : ${k}$ on paper with usable width and height both ${paper} cm. Find the drawn dimensions of the plan and the front elevation, and state whether they will both fit on the paper.`, `Sebuah bilik panjangnya ${l} cm, lebarnya ${w} cm dan tingginya ${h} cm hendak dilukis dengan skala $1 : ${k}$ pada kertas dengan lebar dan tinggi yang boleh digunakan kedua-duanya ${paper} cm. Cari ukuran lukisan bagi pelan dan dongakan depan, dan nyatakan sama ada kedua-duanya akan muat pada kertas itu.`), a: T(`Plan: ${planL} cm by ${planW} cm; front elevation: ${planL} cm by ${frontH} cm. ${fits ? `Yes, every drawn dimension is $\\le ${paper}$ cm, so both fit.` : `No: at least one drawn dimension exceeds ${paper} cm, so a smaller scale (a larger $n$) is needed.`}`, `Pelan: ${planL} cm dengan ${planW} cm; dongakan depan: ${planL} cm dengan ${frontH} cm. ${fits ? `Ya, setiap ukuran lukisan $\\le ${paper}$ cm, jadi kedua-duanya muat.` : `Tidak: sekurang-kurangnya satu ukuran lukisan melebihi ${paper} cm, jadi skala yang lebih kecil (nisbah $n$ yang lebih besar) diperlukan.`}`), w: W(SCALEW, `$${l} \\div ${k} = ${planL}$ cm`, `$${w} \\div ${k} = ${planW}$ cm`, `$${h} \\div ${k} = ${frontH}$ cm`, T(`Plan $= ${planL} \\times ${planW}$ cm; front elevation $= ${planL} \\times ${frontH}$ cm (they share the drawn length).`, `Pelan $= ${planL} \\times ${planW}$ cm; dongakan depan $= ${planL} \\times ${frontH}$ cm (kedua-duanya berkongsi panjang lukisan).`), fits ? T(`Every drawn dimension is at most $${paper}$ cm, so both views fit.`, `Setiap ukuran lukisan selebih-lebihnya $${paper}$ cm, jadi kedua-dua paparan muat.`) : T(`At least one drawn dimension is more than $${paper}$ cm, so they do not both fit; a larger $n$ is needed.`, `Sekurang-kurangnya satu ukuran lukisan melebihi $${paper}$ cm, jadi kedua-duanya tidak muat; nilai $n$ yang lebih besar diperlukan.`)), sp: 'l' };
    },
    // work backwards from a drawn perimeter to find one actual dimension
    (r) => {
      const k = r.pick(SCALES), l = r.int(3, 9) * k, w = r.int(2, 6) * k;
      need(l !== w);
      const per = 2 * (l / k + w / k);
      return { q: T(`A rectangular plan drawn to a scale of $1 : ${k}$ has a perimeter of ${per} cm on the drawing. Its drawn length is ${l / k} cm. Find (a) the drawn width, (b) the actual length and width of the plot.`, `Sebuah pelan segi empat tepat yang dilukis dengan skala $1 : ${k}$ mempunyai perimeter ${per} cm pada lukisan. Panjang lukisannya ialah ${l / k} cm. Cari (a) lebar lukisan, (b) panjang dan lebar sebenar tanah itu.`), a: T(`(a) ${w / k} cm (b) actual length $${l}$ cm, actual width $${w}$ cm`, `(a) ${w / k} cm (b) panjang sebenar $${l}$ cm, lebar sebenar $${w}$ cm`), w: W(T('For a rectangle, half the perimeter is length + width.', 'Bagi segi empat tepat, separuh perimeter ialah panjang + lebar.'), `$${per} \\div 2 = ${per / 2}$ cm`, `$(a)\\ ${per / 2} - ${l / k} = ${w / k}$ cm`, T('Multiply each drawn length by the scale factor to get the actual lengths:', 'Darabkan setiap panjang lukisan dengan faktor skala untuk mendapat panjang sebenar:'), `$(b)\\ ${l / k} \\times ${k} = ${l}$ cm, $${w / k} \\times ${k} = ${w}$ cm`), sp: 'm' };
    },
    // explain the construction-line procedure with a numeric scale example
    (r) => {
      const k = r.pick(SCALES), l = r.int(4, 9), h = r.int(2, 6);
      need(l !== h);
      return { q: T(`Explain, using ${CL.en}s, how a draughtsman transfers the length of a plan (drawn ${l} cm long at a scale of $1 : ${k}$) onto a front elevation directly below it, so that the two views stay aligned.`, `Terangkan, dengan menggunakan ${CL.ms}, bagaimana seorang jurulukis memindahkan panjang sebuah pelan (dilukis sepanjang ${l} cm pada skala $1 : ${k}$) ke atas dongakan depan yang terletak terus di bawahnya, supaya kedua-dua paparan kekal sejajar.`), a: T(`Light vertical ${CL.en}s are drawn straight down from the key points (corners) of the plan; where they cross the level of the front elevation, they mark the same horizontal positions, so the front elevation is drawn ${l} cm long as well, exactly aligned under the plan. The construction lines are erased or left faint; only the final outline is emphasised.`, `${CL.ms[0].toUpperCase() + CL.ms.slice(1)} menegak yang nipis dilukis terus ke bawah daripada titik utama (bucu) pelan itu; apabila ia melintasi aras dongakan depan, ia menandakan kedudukan mengufuk yang sama, jadi dongakan depan turut dilukis sepanjang ${l} cm, tepat sejajar di bawah pelan. Garis binaan itu dipadamkan atau dibiarkan nipis; hanya garis luar akhir ditebalkan.`), w: W(T('The plan and the front elevation share the same length, so the front elevation must be drawn directly below the plan with the same drawn length.', 'Pelan dan dongakan depan berkongsi panjang yang sama, jadi dongakan depan mesti dilukis terus di bawah pelan dengan panjang lukisan yang sama.'), T(`Light vertical construction lines carry the corner positions down, so the front elevation is also ${l} cm long and stays aligned.`, `Garis binaan menegak yang nipis membawa kedudukan bucu ke bawah, jadi dongakan depan juga sepanjang ${l} cm dan kekal sejajar.`), T('Finally the construction lines are erased or left faint and only the outline is emphasised.', 'Akhirnya garis binaan dipadamkan atau dibiarkan nipis dan hanya garis luar ditebalkan.')), sp: 'm' };
    },
    // explain in depth why a student's statement about scale is wrong (uses SCALE_ERRORS)
    (r) => {
      const [wrong, fix] = r.pick(SCALE_ERRORS);
      const k = r.pick(SCALES), V = r.int(2, 9);
      return { q: T(`A student wrote: ${wrong.en} Using a worked numerical example (e.g. an actual length of ${V * k} cm drawn to a scale of $1 : ${k}$), explain fully why this statement is incorrect.`, `Seorang murid menulis: ${wrong.ms} Dengan menggunakan satu contoh berangka (contohnya panjang sebenar ${V * k} cm yang dilukis dengan skala $1 : ${k}$), terangkan sepenuhnya mengapa pernyataan ini tidak tepat.`), a: T(`It is incorrect because ${fix.en}. For instance, with a scale of $1 : ${k}$, an actual length of ${V * k} cm is correctly drawn as $${V * k} \\div ${k} = ${V}$ cm.`, `Ia tidak tepat kerana ${fix.ms}. Sebagai contoh, dengan skala $1 : ${k}$, panjang sebenar ${V * k} cm dilukis dengan betul sebagai $${V * k} \\div ${k} = ${V}$ cm.`), w: W(SCALEW, T(`Worked example: at $1 : ${k}$, an actual $${V * k}$ cm is drawn as $${V * k} \\div ${k} = ${V}$ cm, and reading back gives $${V} \\times ${k} = ${V * k}$ cm.`, `Contoh kerja: pada $1 : ${k}$, panjang sebenar $${V * k}$ cm dilukis sebagai $${V * k} \\div ${k} = ${V}$ cm, dan membacanya semula memberikan $${V} \\times ${k} = ${V * k}$ cm.`), T(`This shows the statement is wrong: ${fix.en}.`, `Ini menunjukkan pernyataan itu salah: ${fix.ms}.`)), sp: 'm' };
    },
    // multi-step with context: two views at the same scale, find a missing actual dimension
    (r) => {
      const c = r.pick(CTXU), k = r.pick(SCALES), Vl = r.int(4, 9), Vw = r.int(2, 6);
      need(Vl !== Vw);
      const dl = (Vl * c.f) / k, dw = (Vw * c.f) / k;
      need(Number.isInteger(dl * 10) && Number.isInteger(dw * 10) && dl > 0 && dw > 0);
      return { q: T(`${SPM.cap(c.obj.en)} is drawn to a scale of $1 : ${k}$. Its plan is drawn $${SPM.n(dl)}$ cm by $${SPM.n(dw)}$ cm. A second drawing, claimed to be its front elevation at the same scale, is drawn $${SPM.n(dw)}$ cm by $${SPM.n(dl)}$ cm (the two drawn dimensions swapped). Explain what is wrong with the second drawing and what its width should be if its length is correctly $${SPM.n(dl)}$ cm.`, `${SPM.cap(c.obj.ms)} dilukis dengan skala $1 : ${k}$. Pelannya dilukis $${SPM.n(dl)}$ cm dengan $${SPM.n(dw)}$ cm. Satu lukisan kedua, yang didakwa sebagai dongakan depannya pada skala yang sama, dilukis $${SPM.n(dw)}$ cm dengan $${SPM.n(dl)}$ cm (kedua-dua ukuran lukisan ditukar ganti). Terangkan apa yang salah dengan lukisan kedua itu dan berapakah lebarnya yang sepatutnya jika panjangnya betul iaitu $${SPM.n(dl)}$ cm.`), a: T(`A front elevation must share the plan's LENGTH (the dimension read along the same direction), not its width; swapping the two drawn dimensions breaks that link. Since its length is correctly $${SPM.n(dl)}$ cm (matching the plan), only its height remains free — its second dimension is not necessarily $${SPM.n(dw)}$ cm at all, because that number was the plan's width, not the object's height.`, `Dongakan depan mesti berkongsi PANJANG pelan (ukuran yang dibaca sepanjang arah yang sama), bukan lebarnya; menukar ganti kedua-dua ukuran lukisan itu memutuskan kaitan tersebut. Memandangkan panjangnya betul iaitu $${SPM.n(dl)}$ cm (sepadan dengan pelan), hanya tingginya yang bebas — ukuran keduanya tidak semestinya $${SPM.n(dw)}$ cm sama sekali, kerana nombor itu ialah lebar pelan, bukan tinggi objek.`), w: W(DIMW, T(`The plan shows length and width: drawn length $${SPM.n(dl)}$ cm, drawn width $${SPM.n(dw)}$ cm.`, `Pelan menunjukkan panjang dan lebar: panjang lukisan $${SPM.n(dl)}$ cm, lebar lukisan $${SPM.n(dw)}$ cm.`), T(`A front elevation shows length and height, so its length must still be $${SPM.n(dl)}$ cm — swapping the two numbers puts the width where the length belongs.`, `Dongakan depan menunjukkan panjang dan tinggi, jadi panjangnya mesti kekal $${SPM.n(dl)}$ cm — menukar ganti kedua-dua nombor itu meletakkan lebar di tempat panjang.`), T(`Its other dimension is the drawn height, which is not given by the plan at all, so it need not be $${SPM.n(dw)}$ cm.`, `Ukuran satu lagi ialah tinggi lukisan, yang langsung tidak diberikan oleh pelan, jadi ia tidak semestinya $${SPM.n(dw)}$ cm.`)), sp: 'l' };
    },
  ];

  SPM.extend('F3-7.3', { e: g3e, m: g3m, a: g3a });

  /* ================================================================ 7.4 Problem solving ======================= */
  /* which of a cuboid's 3 dimensions each view determines (indices align with VIEWS/VFACTS from 7.1) */
  const DIMSOF = [['length', 'width'], ['length', 'height'], ['width', 'height']];
  const FEATS = [{ key: 'length', en: 'length', ms: 'panjang' }, { key: 'width', en: 'width', ms: 'lebar' }, { key: 'height', en: 'height', ms: 'tinggi' }];
  const viewList = (idxs) => T(idxs.map((i) => VIEWS[i].en).join(idxs.length > 1 ? ', ' : '').replace(/, ([^,]*)$/, ' and $1'), idxs.map((i) => VIEWS[i].ms).join(idxs.length > 1 ? ', ' : '').replace(/, ([^,]*)$/, ' dan $1'));
  const pickViewSubset = (r) => {
    const size = r.pick([1, 1, 2, 2, 3]);
    return r.sample([0, 1, 2], size).sort();
  };

  const g4e = [
    // does a given set of views determine a named dimension? (procedurally generated, up to 21 combos)
    (r) => {
      const idxs = pickViewSubset(r), feat = r.pick(FEATS);
      const vl = viewList(idxs);
      const determined = idxs.some((i) => DIMSOF[i].includes(feat.key));
      const gives = idxs.filter((i) => DIMSOF[i].includes(feat.key));
      return { q: T(`A cuboid solid is described only by ${vl.en}. Can its ${feat.en} be determined from this information alone?`, `Sebuah pepejal kuboid dihuraikan hanya oleh ${vl.ms}. Bolehkah ${feat.ms} pepejal itu ditentukan daripada maklumat ini sahaja?`), a: determined ? T('Yes.', 'Boleh.') : T('No.', 'Tidak.'), w: W(DIMW, determined ? T(`${cap(VIEWS[gives[0]].en)} shows the ${feat.en}, so it can be read off: Yes.`, `${cap(VIEWS[gives[0]].ms)} menunjukkan ${feat.ms}, jadi ia boleh dibaca: Boleh.`) : T(`None of the given view(s) shows the ${feat.en}, so it cannot be found: No.`, `Tiada paparan yang diberi menunjukkan ${feat.ms}, jadi ia tidak dapat dicari: Tidak.`)), sp: 's' };
    },
    // MCQ: choose the only solid consistent with a stated plan + front elevation
    (r) => {
      const s = r.pick(SOLIDS);
      const distractors = r.sample(SOLIDS.filter((x) => x !== s && (x.plan.en !== s.plan.en || x.front.en !== s.front.en)), 2);
      const opts = r.shuffle([s, ...distractors]);
      const letter = 'ABC'[opts.indexOf(s)];
      const lines = opts.map((o, i) => T(`${'ABC'[i]}) ${o.en}`, `${'ABC'[i]}) ${o.ms}`));
      return { q: T(`A solid has a plan that is ${s.plan.en} and a front elevation that is ${s.front.en}. Which solid is it?<br>${lines.map((x) => x.en).join('<br>')}`, `Sebuah pepejal mempunyai pelan berbentuk ${s.plan.ms} dan dongakan depan berbentuk ${s.front.ms}. Pepejal manakah ia?<br>${lines.map((x) => x.ms).join('<br>')}`), a: T(`${letter}) ${s.en[0].toUpperCase() + s.en.slice(1)}`, `${letter}) ${s.ms}`), w: W(SHAPEW, ...opts.map((o, i) => T(`${'ABC'[i]}) ${o.en}: plan ${o.plan.en}, front elevation ${o.front.en} ${o === s ? '✓' : '✗'}`, `${'ABC'[i]}) ${o.ms}: pelan ${o.plan.ms}, dongakan depan ${o.front.ms} ${o === s ? '✓' : '✗'}`)), T(`Only ${letter}) matches both views.`, `Hanya ${letter}) sepadan dengan kedua-dua paparan.`)), sp: 'm' };
    },
    // direct cube count from a plan height map
    (r) => {
      const { m } = heightMap(r, 2, 3);
      return { q: T('A display stand is built from unit cubes. Its plan shows the number of cubes stacked at each position. Find the total number of unit cubes used.', 'Sebuah rak pameran dibina daripada kiub unit. Pelannya menunjukkan bilangan kiub yang disusun pada setiap kedudukan. Cari jumlah bilangan kiub unit yang digunakan.'), fig: planFig(m), a: T(`${totalCubes(m)} cubes`, `${totalCubes(m)} kiub`), w: W(T('The number written in each square is the number of cubes stacked there, so add all the numbers on the plan.', 'Nombor yang tertulis dalam setiap petak ialah bilangan kiub yang ditindan di situ, jadi jumlahkan semua nombor pada pelan.'), `$${m.map((row) => row.join(' + ')).join(' + ')} = ${totalCubes(m)}$`), sp: 's' };
    },
  ];

  const g4m = [
    // does a given set of views determine a named dimension? (explain-why version)
    (r) => {
      const idxs = pickViewSubset(r), feat = r.pick(FEATS);
      const vl = viewList(idxs);
      const determined = idxs.some((i) => DIMSOF[i].includes(feat.key));
      const givesFeat = idxs.filter((i) => DIMSOF[i].includes(feat.key));
      return { q: T(`Only ${vl.en} of a cuboid solid are given. Explain whether the ${feat.en} of the solid is uniquely determined by this information.`, `Hanya ${vl.ms} bagi sebuah pepejal kuboid diberikan. Terangkan sama ada ${feat.ms} pepejal itu ditentukan secara unik oleh maklumat ini.`), a: determined
        ? T(`Yes: ${VIEWS[givesFeat[0]].en} directly shows the ${feat.en}, so it is determined.`, `Boleh: ${VIEWS[givesFeat[0]].ms} secara langsung menunjukkan ${feat.ms}, jadi ia ditentukan.`)
        : T(`No: none of the view(s) given show the ${feat.en} (a plan shows length & width, a front elevation shows length & height, a side elevation shows width & height), so it cannot be found without another view.`, `Tidak: tiada paparan yang diberikan menunjukkan ${feat.ms} (pelan menunjukkan panjang & lebar, dongakan depan menunjukkan panjang & tinggi, dongakan sisi menunjukkan lebar & tinggi), jadi ia tidak dapat dicari tanpa paparan lain.`), w: W(DIMW, determined ? T(`${cap(VIEWS[givesFeat[0]].en)} is among the views given, and it shows the ${feat.en} directly.`, `${cap(VIEWS[givesFeat[0]].ms)} termasuk dalam paparan yang diberi, dan ia menunjukkan ${feat.ms} secara langsung.`) : T(`The ${feat.en} appears only on the views that are not given here, so it is not determined.`, `${cap(feat.ms)} hanya muncul pada paparan yang tidak diberikan di sini, jadi ia tidak ditentukan.`)), sp: 'm' };
    },
    // volume from a plan height map with a stated unit-cube edge length
    (r) => {
      const { m } = heightMap(r, 2, 3), e = r.pick([1, 2, 3, 5]);
      const total = totalCubes(m);
      return { q: T(`A stack of storage boxes is arranged as shown in the plan (the number in each square is the number of boxes stacked there). Each box is a cube of edge ${e} m. Find the total volume of all the boxes.`, `Satu timbunan kotak simpanan disusun seperti yang ditunjukkan pada pelan (nombor dalam setiap petak ialah bilangan kotak yang ditindan di situ). Setiap kotak ialah kubus bertepi ${e} m. Cari jumlah isi padu semua kotak itu.`), fig: planFig(m), a: T(`${total} boxes $\\times ${e}^3 = ${total * e ** 3}\\ \\text{m}^3$`, `${total} kotak $\\times ${e}^3 = ${total * e ** 3}\\ \\text{m}^3$`), w: W(T('Add the numbers on the plan to count the boxes, then multiply by the volume of one box.', 'Jumlahkan nombor pada pelan untuk mengira bilangan kotak, kemudian darabkan dengan isi padu satu kotak.'), `$${m.map((row) => row.join(' + ')).join(' + ')} = ${total}$`, `$${e}^3 = ${e ** 3}\\ \\text{m}^3$`, `$${total} \\times ${e ** 3} = ${total * e ** 3}\\ \\text{m}^3$`), sp: 's' };
    },
    // cost problem from a cube-stack plan
    (r) => {
      const { m } = heightMap(r, 2, 3), cost = r.pick([2, 3, 5, 8, 10]);
      const total = totalCubes(m);
      return { q: T(`A sculpture is built from unit cubes arranged as shown in the plan. Each cube costs ${SPM.rm(cost)}. Find the total cost of the cubes used.`, `Sebuah arca dibina daripada kiub unit yang disusun seperti yang ditunjukkan pada pelan. Setiap kiub berharga ${SPM.rm(cost)}. Cari jumlah kos kiub yang digunakan.`), fig: planFig(m), a: T(SPM.rm(total * cost)), w: W(T('Add the numbers on the plan to count the cubes, then multiply by the cost of one cube.', 'Jumlahkan nombor pada pelan untuk mengira bilangan kiub, kemudian darabkan dengan harga satu kiub.'), `$${m.map((row) => row.join(' + ')).join(' + ')} = ${total}$`, T(`${total} × ${SPM.rm(cost)} = ${SPM.rm(total * cost)}`, `${total} × ${SPM.rm(cost)} = ${SPM.rm(total * cost)}`)), sp: 's' };
    },
    // choose the only consistent solid from plan + front + side (three-way MCQ using SOLIDS)
    (r) => {
      const s = r.pick(SOLIDS);
      const distractors = r.sample(SOLIDS.filter((x) => x !== s), 3);
      const opts = r.shuffle([s, ...distractors]);
      const letter = 'ABCD'[opts.indexOf(s)];
      const lines = opts.map((o, i) => T(`${'ABCD'[i]}) ${o.en}`, `${'ABCD'[i]}) ${o.ms}`));
      return { q: T(`A solid has a plan that is ${s.plan.en} and a front elevation that is ${s.front.en}. Choose the only solid, from the options below, that is consistent with both views.<br>${lines.map((x) => x.en).join('<br>')}`, `Sebuah pepejal mempunyai pelan berbentuk ${s.plan.ms} dan dongakan depan berbentuk ${s.front.ms}. Pilih satu-satunya pepejal, daripada pilihan di bawah, yang konsisten dengan kedua-dua paparan itu.<br>${lines.map((x) => x.ms).join('<br>')}`), a: T(`${letter}) ${s.en[0].toUpperCase() + s.en.slice(1)}`, `${letter}) ${s.ms}`), w: W(SHAPEW, ...opts.map((o, i) => T(`${'ABCD'[i]}) ${o.en}: plan ${o.plan.en}, front elevation ${o.front.en} ${o === s ? '✓' : '✗'}`, `${'ABCD'[i]}) ${o.ms}: pelan ${o.plan.ms}, dongakan depan ${o.front.ms} ${o === s ? '✓' : '✗'}`)), T(`Only ${letter}) matches both given views.`, `Hanya ${letter}) sepadan dengan kedua-dua paparan yang diberi.`)), sp: 'm' };
    },
  ];

  const g4a = [
    // does a given set of views determine a named dimension? (multi-part reasoning across several dimensions)
    (r) => {
      const idxs = pickViewSubset(r);
      const vl = viewList(idxs);
      const known = new Set(idxs.flatMap((i) => DIMSOF[i]));
      const yes = FEATS.filter((f) => known.has(f.key)).map((f) => f.en);
      const no = FEATS.filter((f) => !known.has(f.key)).map((f) => f.en);
      return { q: T(`A cuboid solid is described only by ${vl.en}. List every dimension (length, width, height) that IS uniquely determined by this information, and every dimension that is NOT, explaining your reasoning.`, `Sebuah pepejal kuboid dihuraikan hanya oleh ${vl.ms}. Senaraikan setiap ukuran (panjang, lebar, tinggi) yang DITENTUKAN secara unik oleh maklumat ini, dan setiap ukuran yang TIDAK, sambil menerangkan sebabnya.`), a: no.length === 0
        ? T(`All three dimensions (length, width, height) are determined: together, the given view(s) cover every dimension at least once.`, `Ketiga-tiga ukuran (panjang, lebar, tinggi) ditentukan: secara keseluruhan, paparan yang diberikan meliputi setiap ukuran sekurang-kurangnya sekali.`)
        : T(`Determined: ${yes.length ? yes.join(', ') : 'none'}. Not determined: ${no.join(', ')} — because no view among those given shows ${no.join(' or ')} (a plan shows length & width, a front elevation shows length & height, a side elevation shows width & height).`, `Ditentukan: ${yes.length ? yes.join(', ') : 'tiada'}. Tidak ditentukan: ${no.join(', ')} — kerana tiada paparan yang diberikan menunjukkan ${no.join(' atau ')} (pelan menunjukkan panjang & lebar, dongakan depan menunjukkan panjang & tinggi, dongakan sisi menunjukkan lebar & tinggi).`), w: W(DIMW, T(`The given view(s) cover: ${[...known].join(', ')}.`, `Paparan yang diberi meliputi: ${[...known].map((x) => (x === 'length' ? 'panjang' : x === 'width' ? 'lebar' : 'tinggi')).join(', ')}.`), no.length === 0 ? T('That is all three dimensions, so every one is determined.', 'Itulah ketiga-tiga ukuran, jadi setiap satu ditentukan.') : T(`Missing: ${no.join(', ')} — no given view shows ${no.join(' or ')}.`, `Tiada: ${no.map((x) => (x === 'length' ? 'panjang' : x === 'width' ? 'lebar' : 'tinggi')).join(', ')} — tiada paparan yang diberi menunjukkannya.`)), sp: 'm' };
    },
    // full multi-step: scale + cube-stack model combined, find a real quantity
    (r) => {
      const { m } = heightMap(r, 2, 3), e = r.pick([1, 2, 3, 5]), cost = r.pick([2, 3, 5, 8]);
      const total = totalCubes(m);
      const vol = total * e ** 3;
      return { q: T(`A concrete-block wall feature is built from unit blocks arranged as shown in the plan; each block is a cube of edge ${e} m and costs ${SPM.rm(cost)} per cubic metre. Find (a) the total number of blocks, (b) the total volume, (c) the total cost.`, `Suatu ciri dinding blok konkrit dibina daripada blok unit yang disusun seperti yang ditunjukkan pada pelan; setiap blok ialah kubus bertepi ${e} m dan berharga ${SPM.rm(cost)} setiap meter padu. Cari (a) jumlah bilangan blok, (b) jumlah isi padu, (c) jumlah kos.`), fig: planFig(m), a: T(`(a) ${total} blocks (b) ${vol} m$^3$ (c) ${SPM.rm(vol * cost)}`, `(a) ${total} blok (b) ${vol} m$^3$ (c) ${SPM.rm(vol * cost)}`), w: W(T('Add the numbers on the plan, then use volume of one block = edge$^3$ and cost = volume × price per cubic metre.', 'Jumlahkan nombor pada pelan, kemudian gunakan isi padu satu blok = tepi$^3$ dan kos = isi padu × harga bagi setiap meter padu.'), `$(a)\\ ${m.map((row) => row.join(' + ')).join(' + ')} = ${total}$`, `$(b)\\ ${total} \\times ${e}^3 = ${vol}\\ \\text{m}^3$`, T(`(c) ${vol} × ${SPM.rm(cost)} = ${SPM.rm(vol * cost)}`, `(c) ${vol} × ${SPM.rm(cost)} = ${SPM.rm(vol * cost)}`)), sp: 'l' };
    },
    // determine whether the supplied views give a unique missing height (brute-force verified, like 7.2's 'a' puzzle)
    (r) => {
      const rows = 2, cols = 3, HI = 4;
      const { m, front, side } = heightMap(r, rows, cols, 1, HI);
      const i0 = r.int(0, rows - 1), j0 = r.int(0, cols - 1);
      const valid = [];
      for (let v = 1; v <= HI; v++) {
        const colOk = Math.max(v, ...m.map((row, i) => (i === i0 ? 0 : row[j0]))) === front[j0];
        const rowOk = Math.max(v, ...m[i0].map((x, j) => (j === j0 ? 0 : x))) === side[i0];
        if (colOk && rowOk) valid.push(v);
      }
      need(valid.length >= 1);
      const shown = m.map((row, i) => row.map((v, j) => (i === i0 && j === j0 ? '?' : v)));
      const fig = gridFig(rows, cols, (i, j) => shown[i][j]);
      const uniq = valid.length === 1;
      return { q: T(`A cube-stack model is to be rebuilt from its plan, front elevation and side elevation. The plan (shown) is missing the count at one position, marked '?'. The front elevation has column heights ${front.join(', ')} and the side elevation has row heights ${side.join(', ')}. Decide whether the supplied views give enough information to complete the plan uniquely at '?', and justify your decision.`, `Sebuah model timbunan kiub hendak dibina semula daripada pelan, dongakan depan dan dongakan sisinya. Pelan (ditunjukkan) tiada bilangan pada satu kedudukan, ditandakan '?'. Dongakan depan mempunyai ketinggian lajur ${front.join(', ')} dan dongakan sisi mempunyai ketinggian baris ${side.join(', ')}. Tentukan sama ada paparan yang dibekalkan memberikan maklumat yang mencukupi untuk melengkapkan pelan secara unik pada '?', dan berikan justifikasi.`), fig, a: uniq
        ? T(`Yes, the views are sufficient: '?' $= ${valid[0]}$ is the only value consistent with both the column height ${front[j0]} and the row height ${side[i0]}.`, `Ya, paparan itu mencukupi: '?' $= ${valid[0]}$ ialah satu-satunya nilai yang konsisten dengan kedua-dua ketinggian lajur ${front[j0]} dan ketinggian baris ${side[i0]}.`)
        : T(`No, the views are not sufficient: '?' could be $${valid.join('$ or $')}$ and either choice still matches both elevations, so an extra piece of information (such as a direct count) is needed.`, `Tidak, paparan itu tidak mencukupi: '?' boleh menjadi $${valid.join('$ atau $')}$ dan mana-mana pilihan masih sepadan dengan kedua-dua dongakan, jadi maklumat tambahan (seperti bilangan terus) diperlukan.`), w: W(CUBEW, T(`The column containing '?' must reach ${front[j0]} and its row must reach ${side[i0]}.`, `Lajur yang mengandungi '?' mesti mencapai ${front[j0]} dan barisnya mesti mencapai ${side[i0]}.`), T(`Testing every count from $1$ to ${HI} against both conditions leaves ${valid.join(', ')}.`, `Menguji setiap bilangan dari $1$ hingga ${HI} terhadap kedua-dua syarat meninggalkan ${valid.join(', ')}.`), uniq ? T('Only one value survives, so the views are sufficient.', 'Hanya satu nilai kekal, jadi paparan itu mencukupi.') : T('Several values survive, so the views are not sufficient.', 'Beberapa nilai kekal, jadi paparan itu tidak mencukupi.')), sp: 'l' };
    },
    // single-feature version with a follow-up: if not determined, which extra view would fix it? (up to 21 combos)
    (r) => {
      const idxs = pickViewSubset(r), feat = r.pick(FEATS);
      const vl = viewList(idxs);
      const determined = idxs.some((i) => DIMSOF[i].includes(feat.key));
      const missingView = VIEWS.findIndex((_, i) => !idxs.includes(i) && DIMSOF[i].includes(feat.key));
      return { q: T(`A problem gives only ${vl.en} of a cuboid solid, and asks for its ${feat.en}. Decide whether the given information is sufficient. If it is not, name one additional view that, together with what is given, would make the ${feat.en} determinable, and justify your choice.`, `Suatu masalah hanya memberikan ${vl.ms} bagi sebuah pepejal kuboid, dan meminta ${feat.ms} pepejal itu. Tentukan sama ada maklumat yang diberikan mencukupi. Jika tidak, namakan satu paparan tambahan yang, bersama maklumat yang diberikan, akan menjadikan ${feat.ms} dapat ditentukan, dan berikan justifikasi.`), a: determined
        ? T(`Sufficient: one of the given views already shows the ${feat.en} directly, so no additional view is needed.`, `Mencukupi: salah satu paparan yang diberikan sudah menunjukkan ${feat.ms} secara langsung, jadi tiada paparan tambahan diperlukan.`)
        : T(`Not sufficient on its own; adding ${VIEWS[missingView].en} would work, because it shows the ${feat.en} (together with one other dimension) directly.`, `Tidak mencukupi dengan sendirinya; menambah ${VIEWS[missingView].ms} akan berjaya, kerana ia menunjukkan ${feat.ms} (bersama satu ukuran lain) secara langsung.`), w: W(DIMW, determined ? T(`One of the given views already shows the ${feat.en}, so nothing more is needed.`, `Salah satu paparan yang diberi sudah menunjukkan ${feat.ms}, jadi tiada apa-apa lagi diperlukan.`) : T(`None of the given views shows the ${feat.en}; ${VIEWS[missingView].en} does, so adding it makes the ${feat.en} readable.`, `Tiada paparan yang diberi menunjukkan ${feat.ms}; ${VIEWS[missingView].ms} menunjukkannya, jadi menambahnya menjadikan ${feat.ms} dapat dibaca.`)), sp: 'm' };
    },
    // pairwise SOLIDS: explain why 3 of 4 options can be eliminated, given plan + front elevation
    (r) => {
      const s = r.pick(SOLIDS);
      const distractors = r.sample(SOLIDS.filter((x) => x !== s), 3);
      const opts = r.shuffle([s, ...distractors]);
      const letter = 'ABCD'[opts.indexOf(s)];
      const lines = opts.map((o, i) => T(`${'ABCD'[i]}) ${o.en}`, `${'ABCD'[i]}) ${o.ms}`));
      const reasons = opts.map((o, i) => {
        if (o === s) return null;
        const planDiff = o.plan.en !== s.plan.en;
        return T(`${'ABCD'[i]}) ${o.en} is eliminated because its plan (${o.plan.en}) ${planDiff ? `does not match the given plan` : `matches, but its front elevation (${o.front.en}) does not match the given front elevation (${s.front.en})`}.`, `${'ABCD'[i]}) ${o.ms} disingkirkan kerana pelannya (${o.plan.ms}) ${planDiff ? `tidak sepadan dengan pelan yang diberikan` : `sepadan, tetapi dongakan depannya (${o.front.ms}) tidak sepadan dengan dongakan depan yang diberikan (${s.front.ms})`}.`);
      }).filter(Boolean);
      return { q: T(`A solid has a plan that is ${s.plan.en} and a front elevation that is ${s.front.en}. For each option below, state whether it is consistent with both views; eliminate every option that is not, and identify the one solid that remains.<br>${lines.map((x) => x.en).join('<br>')}`, `Sebuah pepejal mempunyai pelan berbentuk ${s.plan.ms} dan dongakan depan berbentuk ${s.front.ms}. Bagi setiap pilihan di bawah, nyatakan sama ada ia konsisten dengan kedua-dua paparan; singkirkan setiap pilihan yang tidak, dan kenal pasti satu pepejal yang tinggal.<br>${lines.map((x) => x.ms).join('<br>')}`), a: T(`${reasons.map((x) => x.en).join(' ')} The remaining, consistent solid is ${letter}) ${s.en}.`, `${reasons.map((x) => x.ms).join(' ')} Pepejal yang konsisten dan tinggal ialah ${letter}) ${s.ms}.`), w: W(SHAPEW, T(`Compare every option with the given pair (plan ${s.plan.en}, front elevation ${s.front.en}):`, `Bandingkan setiap pilihan dengan pasangan yang diberi (pelan ${s.plan.ms}, dongakan depan ${s.front.ms}):`), ...opts.map((o, i) => T(`${'ABCD'[i]}) ${o.en}: ${o.plan.en} / ${o.front.en} ${o === s ? '✓' : '✗'}`, `${'ABCD'[i]}) ${o.ms}: ${o.plan.ms} / ${o.front.ms} ${o === s ? '✓' : '✗'}`)), T(`Only ${letter}) survives both checks.`, `Hanya ${letter}) lulus kedua-dua semakan.`)), sp: 'l' };
    },
  ];

  SPM.extend('F3-7.4', { e: g4e, m: g4m, a: g4a });
})();