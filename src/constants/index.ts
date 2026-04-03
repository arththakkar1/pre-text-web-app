/**
 * Application constants and configuration values
 */

export const DEMO_TEXTS = [
  {
    label: "English",
    text: "The quick brown fox jumps over the lazy dog. Typography is the art and technique of arranging type to make written language legible, readable and appealing when displayed. Good typography is invisible — it guides the eye without calling attention to itself. The best typographers are those who understand that their work exists to serve the reader, not to showcase their own skill. Line length, leading, kerning, and weight all conspire to create an experience that feels effortless when done right and exhausting when done wrong.",
    font: "16px Georgia",
  },
  {
    label: "Mixed CJK + Arabic + Emoji",
    text: "AGI 春天到了. بدأت الرحلة 🚀 こんにちは世界. The future is multilingual — 미래는 다국어입니다. 文字は人類の最も偉大な発明の一つ。 العالم يتحدث بألف لغة 🌏 한국어, 日本語, 中文, हिंदी — all flowing together in one line. Typography must handle them all, seamlessly, without flinching. 这就是 pretext 的力量。",
    font: "16px Arial",
  },
  {
    label: "Japanese",
    text: "羅生門の下で雨やみを待っていた。すると、梯子の中段に、一人の男が蹲っているのを見た。火の光が、かすかに、その男の右の頬を照らした。短い白髪まじりのひげと、やせ細った頬に、朱雀大路の雨の音は絶えず聞こえていた。老婆は右手に松の木片に火をともしたものを持って、その屍骸の一つの顔を覗き込むように眺めていた。",
    font: "16px Arial",
  },
  {
    label: "Arabic RTL",
    text: "في يوم من الأيام، كان هناك ملك عادل يحكم مملكة واسعة. كان الناس يعيشون في سعادة وسلام تحت حكمه الرشيد. وكان الملك يحرص على أن يسمع شكاوى رعاياه بنفسه، ويعمل على حل مشاكلهم بالعدل والإنصاف. وذات يوم، جاءه رجل فقير يشكو من ظلم وقع عليه، فأنصفه الملك وأعاد إليه حقه كاملاً غير منقوص.",
    font: "16px Arial",
  },
  {
    label: "Hindi Devanagari",
    text: "ईदगाह पर बड़ी चहल-पहल थी। हामिद अपने दादा के साथ मेले में आया था। उसके पास केवल तीन पैसे थे। लेकिन उसकी आँखों में एक अजीब चमक थी। वह जानता था कि आज वह कुछ ایسا लेकर जाएगा जो सबसे अलग होगा। मेले में खिलौने थे, मिठाइयाँ थीं, और न जाने क्या-क्या। पर हामिद का मन किसी और चीज़ पर था।",
    font: "16px Arial",
  },
  {
    label: "Korean",
    text: "한글은 조선 시대 세종대왕이 창제한 문자로, 과학적이고 체계적인 구조를 갖추고 있다. 누구나 쉽게 배우고 쓸 수 있도록 설계되었으며, 현재 전 세계에서 가장 독창적인 문자 체계 중 하나로 평가받는다. 한국의 문학과 역사는 이 문자를 통해 수백 년간 기록되어 왔으며, 오늘날에도 디지털 환경에서 완벽하게 작동한다.",
    font: "16px Arial",
  },
  {
    label: "Thai",
    text: "ภาษาไทยเป็นภาษาประจำชาติของประเทศไทย มีอักษรไทยที่เป็นเอกลักษณ์และวรรณคดีอันเก่าแก่ยาวนาน การเขียนไม่มีช่องว่างระหว่างคำ ทำให้การตัดคำเป็นเรื่องที่ซับซ้อน ภาษาไทยมีเสียงวรรณยุกต์ห้าระดับซึ่งทำให้ความหมายของคำเปลี่ยนแปลงไปตามระดับเสียง วรรณคดีไทยมีความงดงามและลึกซึ้งมาตั้งแต่โบราณกาล",
    font: "16px Arial",
  },
  {
    label: "Greek",
    text: "Η ελληνική γλώσσα είναι μια από τις παλαιότερες γλώσσες του κόσμου με αδιάκοπη λογοτεχνική παράδοση από τον Όμηρο έως σήμερα. Η Ιλιάδα και η Οδύσσεια αποτελούν θεμέλια της δυτικής λογοτεχνίας. Η ελληνική αλφάβητος αποτέλεσε τη βάση για το λατινικό και το κυριλλικό αλφάβητο. Σήμερα η γλώσσα εξακολουθεί να εμπλουτίζει την επιστημονική και φιλοσοφική ορολογία του κόσμου.",
    font: "16px Arial",
  },
  {
    label: "Hebrew RTL",
    text: "עברית היא שפה שמית הנכתבת מימין לשמאל. היא שפת התנ״ך, ולאחר אלפי שנים של שימוש כשפה דתית, היא חודשה כשפה מדוברת על ידי אליעזר בן-יהודה בסוף המאה התשע עשרה. כיום היא השפה הרשמית של מדינת ישראל ומדוברת על ידי מיליוני אנשים ברחבי העולם. ספרות עברית עשירה נכתבת בה מאז ימי קדם ועד ימינו.",
    font: "16px Arial",
  },
  {
    label: "Russian Cyrillic",
    text: "Россия — самая большая по площади страна в мире. Её культура, литература и история оказали огромное влияние на весь мир. Великие русские писатели, такие как Толстой, Достоевский и Чехов, создали произведения, которые до сих пор читают и изучают во всём мире. Русский язык является одним из шести официальных языков Организации Объединённых Наций и распространён на огромных территориях.",
    font: "16px Arial",
  },
  {
    label: "Bengali",
    text: "বাংলা ভাষা বিশ্বের অন্যতম প্রধান ভাষা। রবীন্দ্রনাথ ঠাকুর এই ভাষায় সাহিত্য রচনা করে নোবেল পুরস্কার লাভ করেন। বাংলাদেশ ও ভারতের পশ্চিমবঙ্গে এই ভাষা প্রচলিত। ১৯৫২ সালের ভাষা আন্দোলন বাংলা ভাষার মর্যাদা রক্ষায় এক ঐতিহাসিক সংগ্রাম, যা আন্তর্জাতিক মাতৃভাষা দিবসের স্বীকৃতি অর্জন করেছে।",
    font: "16px Arial",
  },
];

export const LINE_HEIGHT = 26;

export const DRAGON_BODY_FONT = '17px "Iowan Old Style", Georgia, serif';

export const DRAGON_LINE_HEIGHT = 28;

export const DRAGON_TEXT = `It was the third candle the abbess had confiscated, and Sable had nodded gravely each time and stolen another from the chapel stores. She kept reading by its unsteady light, hunched beneath her wool blanket in the scriptorium where the novices slept on straw pallets between the copying desks.

It was the bestiary that held her. Not the psalter, not the gospels, not the lives of saints with their wooden sufferings. The bestiary. Some brother at Lindisfarne had painted it two centuries ago, and his creatures had a quality she could not name, a weight to them, as if they had been observed from life rather than copied from pattern books. His lions looked hungry. His basilisks looked bored.

And his dragon, coiled in the lower margin of the forty-seventh leaf, looked like it was breathing. She had watched it for six nights before she was certain. The movement was slight, almost imperceptible at first — a subtle rise and fall of the serpentine chest, the barely-there flutter of the wing membrane. But it was real. The dragon breathed.

She pressed her palm flat against the vellum. The surface was cool and smooth, worn soft by two centuries of handling. The dragon coiled in the lower margin, its proportions wrong in the way that illuminated creatures always were — too large for any ecology, anatomically dreamlike — but bearing some strange internal coherence to its wrongness. It looked like something that hunted. It looked like something that could land. His lions looked hungry. His basilisks looked bored. And this dragon looked patient.

She thought about patience. About a brother at Lindisfarne, two hundred years ago, grinding pigments in the cold. Mixing lamp black and oak gall ink and some red that might have been vermilion or might have been the dried body of an insect. Working by the same unsteady candlelight. Watching something for six nights before he touched the brush to vellum. She wondered what he had watched. She wondered if he had also pressed his palm to a surface and felt something press back. The text flows where the dragon allows.`;

export const MIN_SLOT_WIDTH = 40;
