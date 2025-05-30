import {
  Checkbox,
  Pane,
  RadioGroup,
  SelectField,
  TextInputField,
} from 'evergreen-ui';
// 移除了 useEffect 的导入，因为不再需要此组件中的 useEffect
// import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { Translations } from '../translations';
import './style.css';

export const Settings = (props) => {
  // 变更点 1: 移除不再需要的 console.log
  // console.log('[Settings] firstLoad is', props.firstLoad);

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

  // 变更点 2: 移除整个 useEffect 块，因为 App.js 已处理相关逻辑
  /*
  useEffect(() => {
    // 这段逻辑应该被移动到 App.js 中进行管理
    if (props.firstLoad?.current && window.innerWidth < 500) {
      props.onFirstLoad?.(); // 这将不再被调用
      props.onOrientationChange?.(true); // 默认设置纵向
    }
  }, [props.firstLoad, props.onFirstLoad, props.onOrientationChange]);
  */

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
          onChange={(e) => props.onEapMethodChange(e.target.value)}
        />
      )}
    </Pane>
  );
};
