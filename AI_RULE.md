---
project_name: "HTML to Elementor Migration Framework"
target_platform: "WordPress 7.0.2"
page_builder: "Elementor 4.2.0 (Flexbox Container Standard)"
core_languages: ["HTML5", "CSS3", "JavaScript"]
objective: "경량 마크업 기반의 HTML 웹사이트를 구축하고, 이를 Elementor 페이지 빌더로 완벽하게 이관(Export/Import)하기 위한 구조화 및 자동화 구현"
---

# 🎯 프로젝트 설계 및 AI 코딩 가이드라인

본 문서는 AI가 코드를 생성하고 구조를 설계할 때 반드시 준수해야 하는 절대적인 원칙(Rules)과 구조 명세서입니다. 모든 산출물은 아래의 가이드라인을 100% 충족해야 합니다.

## 1. 파일 및 디렉토리 구조 원칙 (Directory Architecture)
신규 페이지 생성 요청 시, 다음의 규칙에 따라 파일을 구성하고 라우팅합니다.

* **구조화:** 신규 페이지는 `site/` 경로 하위에 순차적인 이름의 폴더를 생성하고, 그 내부에 `index.html`로 작성합니다.
* **대시보드 갱신:** 새 페이지가 생성될 때마다 루트(Root) 경로에 있는 `index.html` (대시보드)에 해당 페이지로 이동할 수 있는 링크를 반드시 추가하여 인덱싱 상태를 유지합니다.
* **예상 디렉토리 트리:**
  ```text
  / (root)
  ├── index.html (Main Dashboard - 모든 site 하위 페이지 링크 포함)
  ├── css/
  │   └── style.css (모든 전역 스타일링)
  └── site/
      ├── page_01/
      │   ├── index.html
      │   └── style.css
      ├── page_02/
      │   ├── index.html
      │   └── style.css
      └── page_03/
          ├── index.html
          └── style.css

## 2. Elementor Export 함수
* **Export 우클릭 메뉴 선택 기능:** 선택된 섹션단위의 HTML 코드를 WordPress Elementor 요소들로 변환하여 Export json 파일로 생성해준다.
* 우선적으로 HTML 블록 코드 사용 금지
* 기본 레이아웃은 내부섹션, 컬럼 요소가 아닌 컨테이너 요소로 작업
* /elementor 경로의 구조 json을 참고하여 export한다.
* elementor-exporter.js 공통 함수로 제작한다.
* 변환되는 블록은 개별 ID를 부여한다.
* HTML css는 custom_css 요소로 추가한다.
* 

## 모든 작업 완료 후 open /index.html
