import { MainLayout } from './components/layout/MainLayout';
import ReloadPrompt from './components/ReloadPrompt';
import { useStore } from './store/useStore';

function App() {
  const { themeConfig } = useStore();

  const dynamicStyles = {
    // Subject
    '--theme-subject': themeConfig.categoryColors.subject,
    '--theme-subject-light': `color-mix(in srgb, ${themeConfig.categoryColors.subject}, white 20%)`,
    '--theme-subject-dark': `color-mix(in srgb, ${themeConfig.categoryColors.subject}, black 20%)`,

    // Verb
    '--theme-verb': themeConfig.categoryColors.verb,
    '--theme-verb-light': `color-mix(in srgb, ${themeConfig.categoryColors.verb}, white 20%)`,
    '--theme-verb-dark': `color-mix(in srgb, ${themeConfig.categoryColors.verb}, black 20%)`,

    // Object
    '--theme-object': themeConfig.categoryColors.object,
    '--theme-object-light': `color-mix(in srgb, ${themeConfig.categoryColors.object}, white 20%)`,
    '--theme-object-dark': `color-mix(in srgb, ${themeConfig.categoryColors.object}, black 20%)`,

    // Qualifier
    '--theme-qualifier': themeConfig.categoryColors.qualifier,
    '--theme-qualifier-light': `color-mix(in srgb, ${themeConfig.categoryColors.qualifier}, white 20%)`,
    '--theme-qualifier-dark': `color-mix(in srgb, ${themeConfig.categoryColors.qualifier}, black 20%)`,

    backgroundColor: themeConfig.backgroundColor,
  } as React.CSSProperties;

  return (
    <div
      style={dynamicStyles}
      className="w-full h-full text-slate-900 transition-colors duration-300"
      data-mode={themeConfig.mode}
    >
      <MainLayout />
      <ReloadPrompt />
    </div>
  );
}

export default App;
