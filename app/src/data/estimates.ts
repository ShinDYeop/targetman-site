import type { Estimate } from "../lib/content";

/** 아직 견적을 등록하지 않았을 때만 보여주는 예시입니다. */
export const SAMPLE_ESTIMATES: Estimate[] = [
  {
    id: -1,
    brand: "벤츠",
    model: "E250",
    trim: "AMG Line",
    contract: "리스",
    termMonths: 48,
    monthlyFrom: 1090000,
    quotedAt: "2026.09.10",
    body:
      "48개월 · 선납 30% · 잔가유예 없음 · 연 2만km 기준으로 뽑은 견적입니다.\n" +
      "선납을 0%로 내리면 월 128만원대, 60개월로 늘리면 월 96만원대가 됩니다.\n" +
      "법인 명의는 부가세 환급 여부에 따라 실부담이 또 달라지니 따로 계산해 드립니다.",
    photo: "",
    published: 1,
    sortOrder: 90,
  },
  {
    id: -2,
    brand: "제네시스",
    model: "GV70",
    trim: "가솔린 2.5T AWD",
    contract: "장기렌트",
    termMonths: 60,
    monthlyFrom: 890000,
    quotedAt: "2026.09.08",
    body:
      "60개월 · 보증금 30% · 연 2만km · 자차 포함 조건입니다.\n" +
      "보험료와 자동차세가 월 납입금에 모두 들어가 있어서 리스와 단순 비교하면 안 됩니다.\n" +
      "만기 때 인수하실 생각이라면 리스 쪽이 유리한 경우가 많습니다.",
    photo: "",
    published: 1,
    sortOrder: 80,
  },
  {
    id: -3,
    brand: "BMW",
    model: "520i",
    trim: "M Sport Package",
    contract: "리스",
    termMonths: 36,
    monthlyFrom: 1240000,
    quotedAt: "2026.09.05",
    body:
      "36개월 · 선납 0% · 잔가 45% 유예 조건입니다.\n" +
      "초기 비용을 거의 안 들이는 대신 만기 때 잔가를 정산해야 합니다. 이 구조를 모르고 계약하면 3년 뒤에 곤란해집니다.\n" +
      "중도해지 위약금이 어떻게 붙는지는 계약 전에 항목별로 다시 설명드립니다.",
    photo: "",
    published: 1,
    sortOrder: 70,
  },
];
