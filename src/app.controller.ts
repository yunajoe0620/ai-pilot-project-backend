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

    const content = `\\documentclass{article}
\\usepackage{amsmath}

\\begin{document}

\\section*{중학생 수준 행렬 문제}

\\begin{enumerate}

    % 문제 1
    \\item 다음 행렬을 더하세요.
    \\[
    A = \\begin{bmatrix} 2 & 4 \\\\ 3 & 5 \\end{bmatrix}, \\quad
    B = \\begin{bmatrix} 1 & 3 \\\\ 2 & 4 \\end{bmatrix}
    \\]

    % 문제 2
    \\item 다음 행렬을 빼세요.
    \\[
    A = \\begin{bmatrix} 6 & 7 \\\\ 4 & 3 \\end{bmatrix}, \\quad
    B = \\begin{bmatrix} 2 & 5 \\\\ 1 & 1 \\end{bmatrix}
    \\]

    % 문제 3
    \\item 다음 두 행렬을 곱하세요.
    \\[
    A = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}, \\quad
    B = \\begin{bmatrix} 2 & 0 \\\\ 1 & 3 \\end{bmatrix}
    \\]

    % 문제 4
    \\item 다음 스칼라 곱을 계산하세요.
    \\[
    k = 3, \\quad A = \\begin{bmatrix} 2 & 4 \\\\ 6 & 8 \\end{bmatrix}
    \\]

    % 문제 5
    \\item 다음 행렬의 전치 행렬을 구하세요.
    \\[
    A = \\begin{bmatrix} 1 & 2 & 3 \\\\ 4 & 5 & 6 \\end{bmatrix}
    \\]

    % 문제 6
    \\item 다음 행렬의 행렬식을 계산하세요.
    \\[
    A = \\begin{bmatrix} 3 & 2 \\\\ 1 & 4 \\end{bmatrix}
    \\]

    % 문제 7
    \\item 다음 행렬의 역행렬을 구하세요.
    \\[
    A = \\begin{bmatrix} 2 & 1 \\\\ 1 & 3 \\end{bmatrix}
    \\]

    % 문제 8
    \\item 다음 행렬 방정식을 푸세요.
    \\[
    \\begin{bmatrix} 2 & 1 \\\\ 1 & 3 \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\end{bmatrix} = \\begin{bmatrix} 5 \\\\ 8 \\end{bmatrix}
    \\]

    % 문제 9
    \\item 다음 행렬의 대각 원소의 합(대각합)을 구하세요.
    \\[
    A = \\begin{bmatrix} 7 & 2 \\\\ 4 & 5 \\end{bmatrix}
    \\]

    % 문제 10
    \\item 두 행렬 $A$, $B$가 아래와 같을 때, $A + 2B$를 구하세요.
    \\[
    A = \\begin{bmatrix} 3 & 1 \\\\ 2 & 4 \\end{bmatrix}, \\quad
    B = \\begin{bmatrix} 1 & 0 \\\\ 5 & 2 \\end{bmatrix}
    \\]

\\end{enumerate}

\\end{document}`;

    return this.appService.createTextFile('LatexTest', content);
  }
}
