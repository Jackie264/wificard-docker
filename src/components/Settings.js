import {
  Checkbox,
  Pane,
  RadioGroup,
  SelectField,
  TextInputField,
} from 'evergreen-ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { Translations } from '../translations';
import './style.css';

export const Settings = (props) => {
  const { t } = useTranslation();
  const encryptionModes = [
    // 明确添加 'None' 选项，表示开放网络
    { label: t('wifi.password.encryption.none'), value: 'None' },
    { label: 'WPA/WPA2/WPA3', value: 'WPA' },
    { label: 'WPA2-EAP', value: 'WPA2-EAP' },
    { label: 'WEP', value: 'WEP' },
  ];
  const eapMethods = [{ label: 'PWD', value: 'PWD' }];
  const langSelectDefaultValue = () => {
    const filteredTranslations = Translations.filter((trans) => trans.id === i18n.language);
    if (filteredTranslations.length !== 1) {
      return 'en-US';
    }
    return filteredTranslations[0].id;
  };

  useEffect(() => {
    // 这里的 props.onFirstLoad 依然被调用，但实际逻辑移到了 App.js 的 handleFirstLoadLogic
    // 这确保了在小屏幕设备上默认设置为纵向打印
    if (props.firstLoad.current && window.innerWidth < 500) {
      props.onFirstLoad(); // 通知 App.js 执行首次加载逻辑 (现在包括设置方向)
      props.onOrientationChange(true); // 默认设置纵向
    }
  }, [props]); // 依赖 props，确保 props 更新时 effect 重新运行

  return (
    <Pane id="settings" maxWidth={props.settings.portrait ? '350px' : '100%'}>
      <SelectField
        width={300}
        inputHeight={38}
        label={t('select')}
        onChange={(e) => props.onLanguageChange(e.target.value)}
        defaultValue={langSelectDefaultValue()}
      >
        {Translations.map((trans) => (
          <option key={trans.id} value={trans.id}>
            {trans.name}
          </option>
        ))}
      </SelectField>

      <Checkbox
        label={t('button.rotate')}
        checked={props.settings.portrait}
        onChange={() => props.onOrientationChange(!props.settings.portrait)}
      />
      <Checkbox
        label={t('button.svg')}
        checked={props.settings.svgImage}
        onChange={() => props.onSvgImageChange(!props.settings.svgImage)}
      />
      <Checkbox
        label={t('wifi.password.hide')}
        checked={props.settings.hidePassword}
        onChange={() =>
          props.onHidePasswordChange(!props.settings.hidePassword)
        }
      />
      <Checkbox
        label={t('wifi.name.hiddenSSID')}
        checked={props.settings.hiddenSSID}
        onChange={() => props.onHiddenSSIDChange(!props.settings.hiddenSSID)}
      />

      <Checkbox
        label={t('cards.tip.hide')}
        checked={props.settings.hideTip}
        onChange={() => props.onHideTipChange(!props.settings.hideTip)}
      />
      <TextInputField
        type="number"
        width={300}
        label={t('cards.additional')}
        value={props.settings.additionalCards}
        onChange={(e) => props.onAdditionalCardsChange(e.target.value)}
      />
      <RadioGroup
        label={t('wifi.password.encryption')}
        size={16}
        value={props.settings.encryptionMode}
        options={encryptionModes}
        onChange={(e) => props.onEncryptionModeChange(e.target.value)}
      />
      {/* EAP 方法仅在 encryptionMode 为 WPA2-EAP 时显示 */}
      {props.settings.encryptionMode === 'WPA2-EAP' && (
        <RadioGroup
          label={t('wifi.encryption.eapMethod')}
          size={16}
          value={props.settings.eapMethod}
          options={eapMethods}
          // 移除了 hidden 类名，直接通过条件渲染控制
          onChange={(e) => props.onEapMethodChange(e.target.value)}
        />
      )}
    </Pane>
  );
};
