/**
 * WP-Copy Integration Layer
 * Premium Right-Click Export UI matching the user's high-fidelity design specification.
 */

(function () {
  'use strict';

  // 1. Dynamically load ElementorExporter core library if not present
  if (typeof window.ElementorExporter === 'undefined') {
    const exporterScript = document.createElement('script');
    exporterScript.src = '../../elementor-exporter.js';
    exporterScript.setAttribute('data-wp-copy-ui', 'true');
    exporterScript.onload = () => console.log('WP-Copy: ElementorExporter core successfully loaded.');
    exporterScript.onerror = () => console.error('WP-Copy: Failed to load ElementorExporter core.');
    document.head.appendChild(exporterScript);
  }

  /**
   * Translate English CSS identifiers (IDs/Classes) to descriptive Korean names.
   */
  function getSectionKoreanName(idOrClass) {
    const name = (idOrClass || '').toLowerCase();
    if (name.includes('hero') || name.includes('top')) return '히어로';
    if (name.includes('stay') || name.includes('about') || name.includes('manifesto')) return '어바웃(소개)';
    if (name.includes('room')) return '객실 목록';
    if (name.includes('club') || name.includes('experience') || name.includes('special')) return '스페셜 경험';
    if (name.includes('info') || name.includes('guide')) return '가이드 정보';
    if (name.includes('booking') || name.includes('reserve')) return '예약 안내';
    if (name.includes('location')) return '오시는 길';
    if (name.includes('header')) return '헤더 네비게이션';
    if (name.includes('footer')) return '푸터';
    return '지정';
  }

  /**
   * Helper to format section raw names nicely.
   */
  function formatSectionEnglishName(idOrClass, tagName) {
    const name = idOrClass || idOrClass.split(' ')[0] || tagName;
    // Capitalize first letter
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, ' ');
  }

  /**
   * Shows a beautiful toast notification to give the user status updates.
   */
  function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.wp-copy-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `wp-copy-toast ${type}`;
    toast.setAttribute('data-wp-copy-ui', 'true');

    let icon = '✨';
    if (type === 'error') icon = '⚠️';
    if (type === 'info') icon = '⚡';

    toast.innerHTML = `
      <div class="wp-copy-toast-icon">${icon}</div>
      <div class="wp-copy-toast-content">
        <div class="wp-copy-toast-title">Elementor Exporter</div>
        <div class="wp-copy-toast-desc">${message}</div>
      </div>
    `;

    document.body.appendChild(toast);

    // Trigger transition
    setTimeout(() => toast.classList.add('show'), 10);

    // Automatically remove after 4.5 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  // 2. Right-Click Context Menu Activation
  document.addEventListener('contextmenu', function (event) {
    // Find closest section, header, or footer
    const targetSection = event.target.closest('section, header, footer');
    if (!targetSection) return;

    // Prevent default browser context menu
    event.preventDefault();

    // Clean up any previously opened custom menus
    const oldMenu = document.querySelector('.wp-copy-context-menu');
    if (oldMenu) oldMenu.remove();

    const sectionIdOrClass = targetSection.id || targetSection.className.split(' ')[0] || '';
    const sectionTagName = targetSection.tagName.toLowerCase();
    
    const engName = formatSectionEnglishName(sectionIdOrClass, sectionTagName);
    const korName = getSectionKoreanName(sectionIdOrClass || sectionTagName);

    // Find the header elements on this page
    const headerElement = document.querySelector('header, .header');

    // Create the custom context menu with premium design
    const menu = document.createElement('div');
    menu.className = 'wp-copy-context-menu';
    menu.setAttribute('data-wp-copy-ui', 'true');

    // Build header HTML
    let menuHtml = `
      <div class="wp-copy-menu-header">
        <div class="wp-copy-header-top">
          <span class="elementor-logo-badge">E</span>
          <span class="wp-copy-header-title">Export: ${engName} Section</span>
        </div>
        <div class="wp-copy-header-subtitle">WP 7.0.2 / 엘리멘터 4.2.0 컨테이너 표준</div>
      </div>
      <div class="wp-copy-menu-items">
    `;

    // Option 1: 우클릭 지정 영역 내보내기
    menuHtml += `
      <button class="wp-copy-menu-item" id="opt-clicked">
        <div class="wp-copy-item-text">
          <span class="wp-copy-item-title">우클릭 지정 영역 내보내기</span>
          <span class="wp-copy-item-desc">현재 선택된 영역을 100% 네이티브로 변환</span>
        </div>
        <span class="wp-copy-badge mint">우클릭 영역</span>
      </button>
    `;

    const isHeaderClicked = sectionTagName === 'header' || targetSection.classList.contains('header');

    // Option 2: 전체 페이지 통합 내보내기 (Only when not clicking header itself)
    if (!isHeaderClicked && headerElement) {
      menuHtml += `
        <button class="wp-copy-menu-item" id="opt-combined">
          <div class="wp-copy-item-text">
            <span class="wp-copy-item-title">전체 페이지 통합 내보내기</span>
            <span class="wp-copy-item-desc">Header + ${engName} 통합 컨테이너 템플릿</span>
          </div>
          <span class="wp-copy-badge purple">전체</span>
        </button>
      `;
    }

    // Option 3: 헤더(네비게이션)만 내보내기 (Only when clicking something else than header)
    if (!isHeaderClicked && headerElement) {
      menuHtml += `
        <button class="wp-copy-menu-item" id="opt-header-only">
          <div class="wp-copy-item-text">
            <span class="wp-copy-item-title">헤더(네비게이션)만 내보내기</span>
            <span class="wp-copy-item-desc">Header 단독 컨테이너 템플릿</span>
          </div>
          <span class="wp-copy-badge blue">JSON</span>
        </button>
      `;
    }

    // Option 4: [섹션명] 섹션만 내보내기
    const mainSectionLabel = isHeaderClicked ? '헤더' : `${korName} 섹션`;
    menuHtml += `
      <button class="wp-copy-menu-item" id="opt-section-only">
        <div class="wp-copy-item-text">
          <span class="wp-copy-item-title">${mainSectionLabel}만 내보내기</span>
          <span class="wp-copy-item-desc">${engName} 단독 컨테이너 템플릿</span>
        </div>
        <span class="wp-copy-badge blue">JSON</span>
      </button>
    `;

    // Cancel Button
    menuHtml += `
      </div>
      <button class="wp-copy-menu-item cancel" id="opt-cancel">취소</button>
    `;

    menu.innerHTML = menuHtml;

    // Positioning the menu dynamically near the mouse click
    const menuWidth = 375;
    const menuHeight = isHeaderClicked ? 210 : 390; // Height varies depending on number of options
    let posX = event.pageX;
    let posY = event.pageY;

    // Boundary containment logic
    if (posX + menuWidth > window.scrollX + window.innerWidth) {
      posX = window.scrollX + window.innerWidth - menuWidth - 20;
    }
    if (posY + menuHeight > window.scrollY + window.innerHeight) {
      posY = window.scrollY + window.innerHeight - menuHeight - 20;
    }

    menu.style.left = `${posX}px`;
    menu.style.top = `${posY}px`;

    document.body.appendChild(menu);

    // --- Action Binding Functions ---
    const runExport = async (elements, title, filename) => {
      menu.remove();
      showToast('HTML 및 CSS 분석 중... Elementor JSON 변환을 준비하고 있습니다.', 'info');
      try {
        if (typeof window.ElementorExporter === 'undefined') {
          throw new Error('ElementorExporter 코어 파일이 로드되지 않았습니다.');
        }
        const result = await window.ElementorExporter.exportElements(elements, title, filename);
        if (result) {
          showToast(`WordPress Elementor 컨테이너 변환 및 내보내기 완료!<br>다운로드 파일: <strong>${filename}</strong>`, 'success');
        } else {
          throw new Error('Elementor 변환에 실패했습니다.');
        }
      } catch (err) {
        console.error('WP-Copy Error:', err);
        showToast(err.message, 'error');
      }
    };

    // Bind Option 1: 우클릭 지정 영역 내보내기
    menu.querySelector('#opt-clicked').addEventListener('click', () => {
      runExport(
        [targetSection],
        `Selected Area — ${engName.toUpperCase()}`,
        `elementor-selected-${sectionIdOrClass || sectionTagName}.json`
      );
    });

    // Bind Option 2: 전체 페이지 통합 내보내기
    const combinedBtn = menu.querySelector('#opt-combined');
    if (combinedBtn) {
      combinedBtn.addEventListener('click', () => {
        runExport(
          [headerElement, targetSection].filter(Boolean),
          `Combined Template — HEADER + ${engName.toUpperCase()}`,
          `elementor-combined-${sectionIdOrClass || sectionTagName}.json`
        );
      });
    }

    // Bind Option 3: 헤더(네비게이션)만 내보내기
    const headerBtn = menu.querySelector('#opt-header-only');
    if (headerBtn) {
      headerBtn.addEventListener('click', () => {
        runExport(
          [headerElement].filter(Boolean),
          'Header Navigation Template',
          'elementor-header-navigation.json'
        );
      });
    }

    // Bind Option 4: 섹션 단독 내보내기
    menu.querySelector('#opt-section-only').addEventListener('click', () => {
      runExport(
        [targetSection],
        `${engName} Section Template`,
        `elementor-${sectionIdOrClass || sectionTagName}.json`
      );
    });

    // Cancel Action
    menu.querySelector('#opt-cancel').addEventListener('click', () => {
      menu.remove();
    });
  });

  // 3. Dismiss context menu on left-click outside
  document.addEventListener('click', function (event) {
    if (!event.target.closest('.wp-copy-context-menu')) {
      const menu = document.querySelector('.wp-copy-context-menu');
      if (menu) menu.remove();
    }
  });
})();
