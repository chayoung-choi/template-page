/**
 * Elementor Exporter Framework (Flexbox Container Standard)
 * Converts HTML sections into importable WordPress Elementor JSON templates.
 * Note: Does not use the HTML widget to ensure compatibility and customizability,
 * using the standard 'text-editor' widget with advanced custom CSS.
 */

const ElementorExporter = {
  /**
   * Generates a unique 7-character hexadecimal ID for Elementor elements.
   */
  generateId() {
    return Math.random().toString(16).substring(2, 9);
  },

  /**
   * Helper to check if a CSS rule is relevant to the given element.
   */
  isRuleRelevant(rule, element) {
    try {
      const selector = rule.selectorText;
      if (!selector) return false;

      // Ignore global body, html, reset, or star selectors
      if (selector === '*' || selector === 'body' || selector === 'html' || selector === 'html, body') {
        return false;
      }

      // Clean selector from pseudo elements for query check (e.g. :hover, ::before)
      const cleanSelector = selector.replace(/:[a-zA-Z-]+/g, '');

      // Check if it matches the element itself
      if (element.matches(cleanSelector)) return true;

      // Check if it matches any child element inside the element
      if (element.querySelector(cleanSelector)) return true;

      // Fallback: check if any of the element's classes or ID are mentioned in the selector text
      const elementClasses = Array.from(element.classList);
      const hasMatchingClass = elementClasses.some(cls => selector.includes('.' + cls));
      if (hasMatchingClass) return true;

      if (element.id && selector.includes('#' + element.id)) {
        return true;
      }
    } catch (e) {
      // If querySelector fails (e.g. invalid syntax for pseudo-elements), fallback to string matching
      const selector = rule.selectorText;
      if (selector) {
        if (element.id && selector.includes('#' + element.id)) return true;
        const elementClasses = Array.from(element.classList);
        return elementClasses.some(cls => selector.includes('.' + cls));
      }
    }
    return false;
  },

  /**
   * Converts CSS selector targeting an element or its children to the Elementor 'selector' placeholder.
   */
  convertSelector(selector, element) {
    const elementClasses = Array.from(element.classList);
    const elementId = element.id;

    // Split selector by commas (e.g., ".rooms, .rooms h2") and convert each part
    const parts = selector.split(',').map(part => {
      let p = part.trim();
      let matchedDirectly = false;

      // Replace element ID
      if (elementId && p.includes('#' + elementId)) {
        p = p.replace(new RegExp('#' + elementId, 'g'), 'selector');
        matchedDirectly = true;
      }

      // Replace element classes
      elementClasses.forEach(cls => {
        if (p.includes('.' + cls)) {
          p = p.replace(new RegExp('\\.' + cls, 'g'), 'selector');
          matchedDirectly = true;
        }
      });

      // If the selector is relative to descendants but doesn't explicitly name the element,
      // and doesn't start with selector, prepend 'selector ' to scope it
      if (!matchedDirectly && !p.startsWith('selector')) {
        p = 'selector ' + p;
      }

      return p;
    });

    return parts.join(', ');
  },

  /**
   * Traverses document stylesheets to extract relevant CSS rules for the element,
   * converting selectors to use Elementor 'selector' syntax.
   */
  extractCss(element) {
    let cssString = '';

    for (const sheet of document.styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;

        for (const rule of rules) {
          // Standard style rules
          if (rule.type === CSSRule.STYLE_RULE) {
            if (this.isRuleRelevant(rule, element)) {
              const convertedSelector = this.convertSelector(rule.selectorText, element);
              const cssBody = rule.cssText.substring(rule.cssText.indexOf('{'));
              cssString += `${convertedSelector} ${cssBody}\n\n`;
            }
          }
          // Media query rules
          else if (rule.type === CSSRule.MEDIA_RULE) {
            let mediaCss = '';
            for (const subRule of rule.cssRules) {
              if (subRule.type === CSSRule.STYLE_RULE && this.isRuleRelevant(subRule, element)) {
                const convertedSelector = this.convertSelector(subRule.selectorText, element);
                const cssBody = subRule.cssText.substring(subRule.cssText.indexOf('{'));
                mediaCss += `  ${convertedSelector} ${cssBody}\n`;
              }
            }
            if (mediaCss) {
              cssString += `@media ${rule.media.mediaText} {\n${mediaCss}}\n\n`;
            }
          }
        }
      } catch (e) {
        // Cross-origin stylesheet security restrictions (safe to ignore)
      }
    }
    return cssString.trim();
  },

  /**
   * General export function: Converts an array of DOM elements into top-level containers inside a single Elementor JSON template.
   */
  async exportElements(elementsList, templateTitle, filename) {
    if (!elementsList || elementsList.length === 0) {
      console.error('No elements provided for Elementor export.');
      return null;
    }

    let containerTemplate = null;
    let widgetTemplate = null;

    // 1. Try to fetch standard schema files from /elementor/ path
    try {
      const containerRes = await fetch('../../elementor/container.json');
      if (containerRes.ok) {
        containerTemplate = await containerRes.json();
      }
    } catch (e) {
      console.warn('Could not fetch elementor/container.json. Using fallback.', e);
    }

    try {
      const widgetRes = await fetch('../../elementor/html-widget.json');
      if (widgetRes.ok) {
        widgetTemplate = await widgetRes.json();
      }
    } catch (e) {
      console.warn('Could not fetch elementor/html-widget.json. Using fallback.', e);
    }

    // High-fidelity fallback templates (standardized on text-editor instead of html)
    if (!containerTemplate) {
      containerTemplate = {
        "id": "",
        "elType": "container",
        "isInner": false,
        "settings": {
          "content_width": "full",
          "flex_direction": "column",
          "justify_content": "flex-start",
          "align_items": "stretch",
          "background_background": "classic",
          "background_color": "#ffffff",
          "padding": {
            "unit": "px",
            "top": "0",
            "right": "0",
            "bottom": "0",
            "left": "0",
            "isLinked": true
          }
        },
        "elements": []
      };
    }

    if (!widgetTemplate) {
      widgetTemplate = {
        "id": "",
        "elType": "widget",
        "widgetType": "text-editor",
        "settings": {
          "editor": "",
          "custom_css": ""
        },
        "elements": []
      };
    }

    const exportedContainers = [];

    // 2. Process each element in the array
    for (const el of elementsList) {
      if (!el) continue;

      // Clone and sanitize HTML
      const clone = el.cloneNode(true);
      clone.querySelectorAll('[data-wp-copy-ui="true"]').forEach(uiEl => uiEl.remove());
      const htmlContent = clone.outerHTML;

      // Extract relevant CSS
      const customCssContent = this.extractCss(el);

      // Create new widget instance
      const widget = JSON.parse(JSON.stringify(widgetTemplate));
      widget.id = this.generateId();
      
      // Support both text-editor and html widgets depending on the schema
      if (widget.widgetType === 'text-editor') {
        widget.settings.editor = htmlContent;
      } else {
        widget.settings.html = htmlContent;
      }
      
      widget.settings.custom_css = customCssContent;

      // Create new container instance
      const container = JSON.parse(JSON.stringify(containerTemplate));
      container.id = this.generateId();
      container.elements = [widget];

      exportedContainers.push(container);
    }

    // 3. Wrap in final Elementor Library Template format
    const finalTemplate = {
      "title": templateTitle,
      "type": "container",
      "version": "0.4",
      "page_settings": [],
      "content": exportedContainers
    };

    // 4. Trigger file download
    this.downloadFile(finalTemplate, filename);

    return finalTemplate;
  },

  /**
   * Main export function (legacy support): Converts single section element into Elementor template JSON and triggers download.
   */
  async exportSection(sectionElement) {
    const sectionName = sectionElement.id || sectionElement.className.split(' ')[0] || 'section';
    return this.exportElements(
      [sectionElement], 
      `Exported Section — ${sectionName.toUpperCase()}`, 
      `elementor-${sectionName}.json`
    );
  },

  /**
   * Forces a browser download of the generated JSON object.
   */
  downloadFile(jsonObject, filename) {
    const jsonString = JSON.stringify(jsonObject, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Export to window if running in browser
if (typeof window !== 'undefined') {
  window.ElementorExporter = ElementorExporter;
}
