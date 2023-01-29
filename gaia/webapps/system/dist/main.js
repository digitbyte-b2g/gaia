/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./scss/context_menu.scss":
/*!********************************!*\
  !*** ./scss/context_menu.scss ***!
  \********************************/
/***/ (() => {

eval("throw new Error(\"Module parse failed: Unexpected token (4:0)\\nYou may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders\\n|  * Context menu\\n|  */\\n> #context-menu {\\n|   position: absolute;\\n|   left: 0;\");\n\n//# sourceURL=webpack://desktop-system/./scss/context_menu.scss?");

/***/ }),

/***/ "./src/context_menu.js":
/*!*****************************!*\
  !*** ./src/context_menu.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _scss_context_menu_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scss/context_menu.scss */ \"./scss/context_menu.scss\");\n/* harmony import */ var _scss_context_menu_scss__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_scss_context_menu_scss__WEBPACK_IMPORTED_MODULE_0__);\n\n\nfunction contextMenu(evt, array) {\n  var overlay = document.getElementById('context-menu');\n  overlay.classList.add('visible');\n\n  var containerElement = document.getElementById('context-menu-content-items');\n  containerElement.innerHTML = '';\n\n  document.onclick = () => {\n    overlay.classList.remove('visible');\n  };\n\n  array.forEach(obj => {\n    var element = document.createElement('li');\n    containerElement.appendChild(element);\n\n    if (obj.type == 'separator') {\n      element.classList.add('separator');\n      return;\n    }\n\n    if (obj.label) {\n      element.textContent = obj.label;\n    }\n    if (obj.l10nId) {\n      element.dataset.l10nId = obj.l10nId;\n    }\n    if (obj.disabled) {\n      element.setAttribute('disabled', '');\n    }\n    if (obj.icon) {\n      element.dataset.icon = obj.icon;\n    }\n\n    element.onclick = obj.onclick;\n\n    if (evt.pageX >= (window.innerWidth - overlay.getBoundingClientRect().width)) {\n      overlay.style.left = (evt.pageX - overlay.getBoundingClientRect().width) + 'px';\n    } else {\n      overlay.style.left = evt.pageX + 'px';\n    }\n    if (evt.pageY >= (window.innerHeight - overlay.getBoundingClientRect().height)) {\n      overlay.style.top = (evt.pageY - overlay.getBoundingClientRect().height) + 'px';\n      overlay.classList.add('bottom');\n    } else {\n      overlay.style.top = evt.pageY + 'px';\n      overlay.classList.remove('bottom');\n    }\n  });\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (contextMenu);\n\n\n//# sourceURL=webpack://desktop-system/./src/context_menu.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _context_menu_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./context_menu.js */ \"./src/context_menu.js\");\n\n\nwindow.contextMenu = _context_menu_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"];\n\n\n//# sourceURL=webpack://desktop-system/./src/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ })()
;