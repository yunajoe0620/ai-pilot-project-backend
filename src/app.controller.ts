import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // \documentclass{article}
  // 문서의 유형을 설정합니다. 여기서는 article 클래스를 사용하고 있으며,
  // 이는 일반적인 기사, 논문, 보고서 등을 작성할 때 사용하는 기본 클래스입니다.

  //  \usepackage{amsmath}
  //   amsmath 패키지는 고급 수학 수식 및 기호를 제공하는 패키지입니다. 이 패키지를 사용하면 LaTeX에서 복잡한 수학식을 쉽게 작성할 수 있습니다.

  // 글꼴 인코딩을 T1로 설정합니다. 이는 주로 유럽 언어(예: 독일어, 프랑스어, 스페인어 등)에서 사용하는 글꼴 인코딩 방식으로, 일반적인 ASCII 인코딩 대신 더 다양한 문자를 지원합니다. 특히 아크센트가 있는 문자들을 올바르게 출력할 수 있습니다.
  //  \usepackage[T1]{fontenc}
  @Get('/test')
  getTest(): string {
    // .Tex파일 기본 구조
    // 저장하는 .Tex 파일 이름에는 공백이나 특수 문자를 사용X, 공백대신 밑줄(_)를  사용
    // \documentclass{article}
    // \begin{document}
    // Hello, LaTeX!
    // \end{document}

    const content = `
    \\documentclass{article}
    \\usepackage{amsmath}
    \\usepackage{fontspec}
    \\usepackage{kotex} % 한국어 지원

    \\begin{document}

    \\title{행렬 문제}

    다음 두 행렬 \\( A \\)와 \\( B \\)가 주어졌을 때, \\( A \\times B \\)를 구하시오.  
          \\[
          A = \\begin{bmatrix}
          10 & 2 & 3 \\\\
          4 & 5 & 6 \\\\
          \\end{bmatrix}
          \\quad
          B = \\begin{bmatrix}
          7 & 8 \\\\
          9 & 10 \\\\
          11 & 12 \\\\
          \\end{bmatrix}
          \\]
    \\end{document}      
    `;

    return this.appService.createTextFile('LatexTest', content);
  }
}
