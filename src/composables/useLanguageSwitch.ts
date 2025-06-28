// useLanguageSwitch.ts
// Composable for language switch logic (RU/EN)
import { ref } from "vue";

export function useLanguageSwitch(defaultRussian = true) {
  const useRussian = ref(defaultRussian);
  const showLanguageMenu = ref(false);

  const toggleLanguageMenu = () => {
    showLanguageMenu.value = !showLanguageMenu.value;
  };

  const selectLanguage = (russian: boolean) => {
    useRussian.value = russian;
    showLanguageMenu.value = false;
  };

  const closeLanguageMenu = (event: Event) => {
    const target = event.target as HTMLElement;
    const menu = document.querySelector(".language-menu");
    if (menu && !menu.contains(target)) {
      showLanguageMenu.value = false;
    }
  };

  return {
    useRussian,
    showLanguageMenu,
    toggleLanguageMenu,
    selectLanguage,
    closeLanguageMenu,
  };
}
