// [너무 쉬움, 너무 어려움, 주제에 맞지 않음, 중복 문제, 설명이 부족함, 문제가 적절치 않음, 부적절한 표현, 부정확한 이미지, 기타]
export enum DeleteReason {
  '너무 쉬움',
  '너무 어려움',
  '주제에 맞지 않음',
  '중복 문제',
  '설명이 부족함',
  '문제가 적절치 않음',
  '부적절한 표현',
  '부정확한 이미지',
  '기타',
}

export enum Difficulty {
  '경시대회 수준',
  '심화',
  '고난이도',
  '보통 난이도',
  '기본',
}

export enum QuestionType {
  '개념설명',
  '객관식',
  '서술형',
  '단답형',
}

export enum SchoolLevel {
  Elementary1 = 11,
  Middle1 = 21,
  HighScholle1 = 31,
}

export enum Subject {
  '국어',
  '수학',
  '과학',
  '영어',
}
