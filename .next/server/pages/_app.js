/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./lib/supabaseClient.ts":
/*!*******************************!*\
  !*** ./lib/supabaseClient.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getSupabase: () => (/* binding */ getSupabase),\n/* harmony export */   supabase: () => (/* binding */ supabase)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"@supabase/supabase-js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__);\n// lib/supabaseClient.ts\n\n// Ambil environment variable dari .env.local\nconst SUPABASE_URL = \"https://gspmrhanymtnzllaitiu.supabase.co\" || 0;\nconst SUPABASE_ANON_KEY = \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzcG1yaGFueW10bnpsbGFpdGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzMyNjUsImV4cCI6MjA3NTk0OTI2NX0.KgX4SiFkLzwokbrnIjQYXi2_-qGJSgNuNv2w4_Dpmuc\" || 0;\n// Validasi agar tidak error saat build\nif (!SUPABASE_URL || !SUPABASE_ANON_KEY) {\n    if (false) {}\n}\n// Supabase client tunggal (singleton pattern)\nlet client = null;\n/**\r\n * Pastikan hanya ada satu instance Supabase di seluruh aplikasi.\r\n * Ini mencegah multiple connections saat Fast Refresh di dev mode.\r\n */ function getSupabase() {\n    if (!client) {\n        client = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(SUPABASE_URL, SUPABASE_ANON_KEY, {\n            auth: {\n                persistSession: true,\n                autoRefreshToken: true,\n                detectSessionInUrl: true\n            },\n            realtime: {\n                params: {\n                    eventsPerSecond: 10\n                }\n            }\n        });\n    }\n    return client;\n}\n// export default (opsional)\nconst supabase = getSupabase();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9saWIvc3VwYWJhc2VDbGllbnQudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBLHdCQUF3QjtBQUM2QztBQUVyRSw2Q0FBNkM7QUFDN0MsTUFBTUMsZUFBZUMsMENBQW9DLElBQUksQ0FBRTtBQUMvRCxNQUFNRyxvQkFBb0JILGtOQUF5QyxJQUFJLENBQUU7QUFFekUsdUNBQXVDO0FBQ3ZDLElBQUksQ0FBQ0QsZ0JBQWdCLENBQUNJLG1CQUFtQjtJQUN2QyxJQUFJLEtBQTZCLEVBQUUsRUFJbEM7QUFDSDtBQUVBLDhDQUE4QztBQUM5QyxJQUFJSSxTQUFnQztBQUVwQzs7O0NBR0MsR0FDTSxTQUFTQztJQUNkLElBQUksQ0FBQ0QsUUFBUTtRQUNYQSxTQUFTVCxtRUFBWUEsQ0FBQ0MsY0FBY0ksbUJBQW1CO1lBQ3JETSxNQUFNO2dCQUNKQyxnQkFBZ0I7Z0JBQ2hCQyxrQkFBa0I7Z0JBQ2xCQyxvQkFBb0I7WUFDdEI7WUFDQUMsVUFBVTtnQkFDUkMsUUFBUTtvQkFBRUMsaUJBQWlCO2dCQUFHO1lBQ2hDO1FBQ0Y7SUFDRjtJQUNBLE9BQU9SO0FBQ1Q7QUFFQSw0QkFBNEI7QUFDckIsTUFBTVMsV0FBV1IsY0FBYyIsInNvdXJjZXMiOlsid2VicGFjazovL3lheWFzYW4tYW1hbGlhbnVyLWNvbXBsZXRlLy4vbGliL3N1cGFiYXNlQ2xpZW50LnRzPzNhN2QiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gbGliL3N1cGFiYXNlQ2xpZW50LnRzXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCwgU3VwYWJhc2VDbGllbnQgfSBmcm9tIFwiQHN1cGFiYXNlL3N1cGFiYXNlLWpzXCI7XHJcblxyXG4vLyBBbWJpbCBlbnZpcm9ubWVudCB2YXJpYWJsZSBkYXJpIC5lbnYubG9jYWxcclxuY29uc3QgU1VQQUJBU0VfVVJMID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIHx8IFwiXCI7XHJcbmNvbnN0IFNVUEFCQVNFX0FOT05fS0VZID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVkgfHwgXCJcIjtcclxuXHJcbi8vIFZhbGlkYXNpIGFnYXIgdGlkYWsgZXJyb3Igc2FhdCBidWlsZFxyXG5pZiAoIVNVUEFCQVNFX1VSTCB8fCAhU1VQQUJBU0VfQU5PTl9LRVkpIHtcclxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgY29uc29sZS53YXJuKFxyXG4gICAgICBcIltTdXBhYmFzZV0g4pqg77iPIE1pc3NpbmcgZW52aXJvbm1lbnQgdmFyaWFibGVzOiBORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwgb3IgTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVlcIlxyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFN1cGFiYXNlIGNsaWVudCB0dW5nZ2FsIChzaW5nbGV0b24gcGF0dGVybilcclxubGV0IGNsaWVudDogU3VwYWJhc2VDbGllbnQgfCBudWxsID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBQYXN0aWthbiBoYW55YSBhZGEgc2F0dSBpbnN0YW5jZSBTdXBhYmFzZSBkaSBzZWx1cnVoIGFwbGlrYXNpLlxyXG4gKiBJbmkgbWVuY2VnYWggbXVsdGlwbGUgY29ubmVjdGlvbnMgc2FhdCBGYXN0IFJlZnJlc2ggZGkgZGV2IG1vZGUuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3VwYWJhc2UoKTogU3VwYWJhc2VDbGllbnQge1xyXG4gIGlmICghY2xpZW50KSB7XHJcbiAgICBjbGllbnQgPSBjcmVhdGVDbGllbnQoU1VQQUJBU0VfVVJMLCBTVVBBQkFTRV9BTk9OX0tFWSwge1xyXG4gICAgICBhdXRoOiB7XHJcbiAgICAgICAgcGVyc2lzdFNlc3Npb246IHRydWUsIC8vIGJpYXIgdXNlciBsb2dpbiBuZ2dhayBrZS1yZXNldCBzYWF0IHJlZnJlc2hcclxuICAgICAgICBhdXRvUmVmcmVzaFRva2VuOiB0cnVlLFxyXG4gICAgICAgIGRldGVjdFNlc3Npb25JblVybDogdHJ1ZSxcclxuICAgICAgfSxcclxuICAgICAgcmVhbHRpbWU6IHtcclxuICAgICAgICBwYXJhbXM6IHsgZXZlbnRzUGVyU2Vjb25kOiAxMCB9LCAvLyBzdXBheWEgcmVhbHRpbWUgc3RhYmlsXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuICB9XHJcbiAgcmV0dXJuIGNsaWVudDtcclxufVxyXG5cclxuLy8gZXhwb3J0IGRlZmF1bHQgKG9wc2lvbmFsKVxyXG5leHBvcnQgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZSgpO1xyXG4iXSwibmFtZXMiOlsiY3JlYXRlQ2xpZW50IiwiU1VQQUJBU0VfVVJMIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsIlNVUEFCQVNFX0FOT05fS0VZIiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVkiLCJjb25zb2xlIiwid2FybiIsImNsaWVudCIsImdldFN1cGFiYXNlIiwiYXV0aCIsInBlcnNpc3RTZXNzaW9uIiwiYXV0b1JlZnJlc2hUb2tlbiIsImRldGVjdFNlc3Npb25JblVybCIsInJlYWx0aW1lIiwicGFyYW1zIiwiZXZlbnRzUGVyU2Vjb25kIiwic3VwYWJhc2UiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./lib/supabaseClient.ts\n");

/***/ }),

/***/ "./pages/_app.tsx":
/*!************************!*\
  !*** ./pages/_app.tsx ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/head */ \"next/head\");\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_head__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _lib_supabaseClient__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../lib/supabaseClient */ \"./lib/supabaseClient.ts\");\n\n\n\n\n\nfunction MyApp({ Component, pageProps }) {\n    const supabase = (0,_lib_supabaseClient__WEBPACK_IMPORTED_MODULE_4__.getSupabase)();\n    const [settings, setSettings] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(null);\n    (0,react__WEBPACK_IMPORTED_MODULE_3__.useEffect)(()=>{\n        const load = async ()=>{\n            const { data } = await supabase.from(\"settings\").select(\"*\").single();\n            setSettings(data ?? null);\n        };\n        load();\n        // Realtime listener\n        const settingsSub = supabase.channel(\"settings-changes\").on(\"postgres_changes\", {\n            event: \"*\",\n            schema: \"public\",\n            table: \"settings\"\n        }, async ()=>{\n            const { data } = await supabase.from(\"settings\").select(\"*\").single();\n            setSettings(data ?? null);\n        }).subscribe();\n        return ()=>{\n            supabase.removeChannel(settingsSub);\n        };\n    }, [\n        supabase\n    ]);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_head__WEBPACK_IMPORTED_MODULE_2___default()), {\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"title\", {\n                        children: settings?.meta_title || \"Yayasan Amalianur\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\USER\\\\Downloads\\\\yayasan amalianur\\\\pages\\\\_app.tsx\",\n                        lineNumber: 39,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        name: \"description\",\n                        content: settings?.meta_description || \"Yayasan Amalianur – Lembaga pendidikan Islam modern dan berakhlak mulia.\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\USER\\\\Downloads\\\\yayasan amalianur\\\\pages\\\\_app.tsx\",\n                        lineNumber: 40,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        name: \"keywords\",\n                        content: settings?.meta_keywords || \"Yayasan Amalianur, Pendidikan, Islam\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\USER\\\\Downloads\\\\yayasan amalianur\\\\pages\\\\_app.tsx\",\n                        lineNumber: 44,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        name: \"author\",\n                        content: settings?.meta_author || \"Yayasan Amalianur\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\USER\\\\Downloads\\\\yayasan amalianur\\\\pages\\\\_app.tsx\",\n                        lineNumber: 45,\n                        columnNumber: 9\n                    }, this),\n                    settings?.meta_image && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        property: \"og:image\",\n                        content: settings.meta_image\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\USER\\\\Downloads\\\\yayasan amalianur\\\\pages\\\\_app.tsx\",\n                        lineNumber: 46,\n                        columnNumber: 34\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"link\", {\n                        rel: \"icon\",\n                        href: settings?.favicon_url || \"/favicon.ico\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\USER\\\\Downloads\\\\yayasan amalianur\\\\pages\\\\_app.tsx\",\n                        lineNumber: 47,\n                        columnNumber: 9\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"C:\\\\Users\\\\USER\\\\Downloads\\\\yayasan amalianur\\\\pages\\\\_app.tsx\",\n                lineNumber: 38,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                ...pageProps\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\USER\\\\Downloads\\\\yayasan amalianur\\\\pages\\\\_app.tsx\",\n                lineNumber: 49,\n                columnNumber: 7\n            }, this)\n        ]\n    }, void 0, true);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUE4QjtBQUNEO0FBQ2U7QUFDUTtBQUdwRCxTQUFTSSxNQUFNLEVBQUVDLFNBQVMsRUFBRUMsU0FBUyxFQUFZO0lBQy9DLE1BQU1DLFdBQVdKLGdFQUFXQTtJQUM1QixNQUFNLENBQUNLLFVBQVVDLFlBQVksR0FBR1AsK0NBQVFBLENBQU07SUFFOUNELGdEQUFTQSxDQUFDO1FBQ1IsTUFBTVMsT0FBTztZQUNYLE1BQU0sRUFBRUMsSUFBSSxFQUFFLEdBQUcsTUFBTUosU0FBU0ssSUFBSSxDQUFDLFlBQVlDLE1BQU0sQ0FBQyxLQUFLQyxNQUFNO1lBQ25FTCxZQUFZRSxRQUFRO1FBQ3RCO1FBQ0FEO1FBRUEsb0JBQW9CO1FBQ3BCLE1BQU1LLGNBQWNSLFNBQ2pCUyxPQUFPLENBQUMsb0JBQ1JDLEVBQUUsQ0FDRCxvQkFDQTtZQUFFQyxPQUFPO1lBQUtDLFFBQVE7WUFBVUMsT0FBTztRQUFXLEdBQ2xEO1lBQ0UsTUFBTSxFQUFFVCxJQUFJLEVBQUUsR0FBRyxNQUFNSixTQUFTSyxJQUFJLENBQUMsWUFBWUMsTUFBTSxDQUFDLEtBQUtDLE1BQU07WUFDbkVMLFlBQVlFLFFBQVE7UUFDdEIsR0FFRFUsU0FBUztRQUVaLE9BQU87WUFDTGQsU0FBU2UsYUFBYSxDQUFDUDtRQUN6QjtJQUNGLEdBQUc7UUFBQ1I7S0FBUztJQUViLHFCQUNFOzswQkFDRSw4REFBQ1Asa0RBQUlBOztrQ0FDSCw4REFBQ3VCO2tDQUFPZixVQUFVZ0IsY0FBYzs7Ozs7O2tDQUNoQyw4REFBQ0M7d0JBQ0NDLE1BQUs7d0JBQ0xDLFNBQVNuQixVQUFVb0Isb0JBQW9COzs7Ozs7a0NBRXpDLDhEQUFDSDt3QkFBS0MsTUFBSzt3QkFBV0MsU0FBU25CLFVBQVVxQixpQkFBaUI7Ozs7OztrQ0FDMUQsOERBQUNKO3dCQUFLQyxNQUFLO3dCQUFTQyxTQUFTbkIsVUFBVXNCLGVBQWU7Ozs7OztvQkFDckR0QixVQUFVdUIsNEJBQWMsOERBQUNOO3dCQUFLTyxVQUFTO3dCQUFXTCxTQUFTbkIsU0FBU3VCLFVBQVU7Ozs7OztrQ0FDL0UsOERBQUNFO3dCQUFLQyxLQUFJO3dCQUFPQyxNQUFNM0IsVUFBVTRCLGVBQWU7Ozs7Ozs7Ozs7OzswQkFFbEQsOERBQUMvQjtnQkFBVyxHQUFHQyxTQUFTOzs7Ozs7OztBQUc5QjtBQUVBLGlFQUFlRixLQUFLQSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8veWF5YXNhbi1hbWFsaWFudXItY29tcGxldGUvLi9wYWdlcy9fYXBwLnRzeD8yZmJlIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBcIkAvc3R5bGVzL2dsb2JhbHMuY3NzXCI7XG5pbXBvcnQgSGVhZCBmcm9tIFwibmV4dC9oZWFkXCI7XG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBnZXRTdXBhYmFzZSB9IGZyb20gXCIuLi9saWIvc3VwYWJhc2VDbGllbnRcIjtcbmltcG9ydCB0eXBlIHsgQXBwUHJvcHMgfSBmcm9tIFwibmV4dC9hcHBcIjtcblxuZnVuY3Rpb24gTXlBcHAoeyBDb21wb25lbnQsIHBhZ2VQcm9wcyB9OiBBcHBQcm9wcykge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlKCk7XG4gIGNvbnN0IFtzZXR0aW5ncywgc2V0U2V0dGluZ3NdID0gdXNlU3RhdGU8YW55PihudWxsKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGxvYWQgPSBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCB7IGRhdGEgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oXCJzZXR0aW5nc1wiKS5zZWxlY3QoXCIqXCIpLnNpbmdsZSgpO1xuICAgICAgc2V0U2V0dGluZ3MoZGF0YSA/PyBudWxsKTtcbiAgICB9O1xuICAgIGxvYWQoKTtcblxuICAgIC8vIFJlYWx0aW1lIGxpc3RlbmVyXG4gICAgY29uc3Qgc2V0dGluZ3NTdWIgPSBzdXBhYmFzZVxuICAgICAgLmNoYW5uZWwoXCJzZXR0aW5ncy1jaGFuZ2VzXCIpXG4gICAgICAub24oXG4gICAgICAgIFwicG9zdGdyZXNfY2hhbmdlc1wiLCBcbiAgICAgICAgeyBldmVudDogXCIqXCIsIHNjaGVtYTogXCJwdWJsaWNcIiwgdGFibGU6IFwic2V0dGluZ3NcIiB9LCBcbiAgICAgICAgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHsgZGF0YSB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbShcInNldHRpbmdzXCIpLnNlbGVjdChcIipcIikuc2luZ2xlKCk7XG4gICAgICAgICAgc2V0U2V0dGluZ3MoZGF0YSA/PyBudWxsKTtcbiAgICAgICAgfVxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSgpO1xuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHN1cGFiYXNlLnJlbW92ZUNoYW5uZWwoc2V0dGluZ3NTdWIpO1xuICAgIH07XG4gIH0sIFtzdXBhYmFzZV0pO1xuXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxIZWFkPlxuICAgICAgICA8dGl0bGU+e3NldHRpbmdzPy5tZXRhX3RpdGxlIHx8IFwiWWF5YXNhbiBBbWFsaWFudXJcIn08L3RpdGxlPlxuICAgICAgICA8bWV0YVxuICAgICAgICAgIG5hbWU9XCJkZXNjcmlwdGlvblwiXG4gICAgICAgICAgY29udGVudD17c2V0dGluZ3M/Lm1ldGFfZGVzY3JpcHRpb24gfHwgXCJZYXlhc2FuIEFtYWxpYW51ciDigJMgTGVtYmFnYSBwZW5kaWRpa2FuIElzbGFtIG1vZGVybiBkYW4gYmVyYWtobGFrIG11bGlhLlwifVxuICAgICAgICAvPlxuICAgICAgICA8bWV0YSBuYW1lPVwia2V5d29yZHNcIiBjb250ZW50PXtzZXR0aW5ncz8ubWV0YV9rZXl3b3JkcyB8fCBcIllheWFzYW4gQW1hbGlhbnVyLCBQZW5kaWRpa2FuLCBJc2xhbVwifSAvPlxuICAgICAgICA8bWV0YSBuYW1lPVwiYXV0aG9yXCIgY29udGVudD17c2V0dGluZ3M/Lm1ldGFfYXV0aG9yIHx8IFwiWWF5YXNhbiBBbWFsaWFudXJcIn0gLz5cbiAgICAgICAge3NldHRpbmdzPy5tZXRhX2ltYWdlICYmIDxtZXRhIHByb3BlcnR5PVwib2c6aW1hZ2VcIiBjb250ZW50PXtzZXR0aW5ncy5tZXRhX2ltYWdlfSAvPn1cbiAgICAgICAgPGxpbmsgcmVsPVwiaWNvblwiIGhyZWY9e3NldHRpbmdzPy5mYXZpY29uX3VybCB8fCBcIi9mYXZpY29uLmljb1wifSAvPlxuICAgICAgPC9IZWFkPlxuICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxuICAgIDwvPlxuICApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBNeUFwcDsiXSwibmFtZXMiOlsiSGVhZCIsInVzZUVmZmVjdCIsInVzZVN0YXRlIiwiZ2V0U3VwYWJhc2UiLCJNeUFwcCIsIkNvbXBvbmVudCIsInBhZ2VQcm9wcyIsInN1cGFiYXNlIiwic2V0dGluZ3MiLCJzZXRTZXR0aW5ncyIsImxvYWQiLCJkYXRhIiwiZnJvbSIsInNlbGVjdCIsInNpbmdsZSIsInNldHRpbmdzU3ViIiwiY2hhbm5lbCIsIm9uIiwiZXZlbnQiLCJzY2hlbWEiLCJ0YWJsZSIsInN1YnNjcmliZSIsInJlbW92ZUNoYW5uZWwiLCJ0aXRsZSIsIm1ldGFfdGl0bGUiLCJtZXRhIiwibmFtZSIsImNvbnRlbnQiLCJtZXRhX2Rlc2NyaXB0aW9uIiwibWV0YV9rZXl3b3JkcyIsIm1ldGFfYXV0aG9yIiwibWV0YV9pbWFnZSIsInByb3BlcnR5IiwibGluayIsInJlbCIsImhyZWYiLCJmYXZpY29uX3VybCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/_app.tsx\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "@supabase/supabase-js":
/*!****************************************!*\
  !*** external "@supabase/supabase-js" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@supabase/supabase-js");

/***/ }),

/***/ "next/head":
/*!****************************!*\
  !*** external "next/head" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/head");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./pages/_app.tsx"));
module.exports = __webpack_exports__;

})();