export class MiddleSchoolService {
  async generateThePowersOfNaturalNumbers() {
    try {
      const randomNumber = (await Math.floor(Math.random() * 1000)) + 1;
      return {
        problem: randomNumber,
        answer: Math.pow(randomNumber, 2),
      };
    } catch (error) {
      throw error;
    }
  }
}
