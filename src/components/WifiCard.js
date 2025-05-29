import {
  CameraIcon,
  Card,
  Heading,
  MobilePhoneIcon,
  Pane,
  Paragraph,
  Text,
  TextareaField,
} from 'evergreen-ui';
// 确保你已经安装了 qrcode.react，它包含 QRCodeCanvas 和 QRCodeSVG
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import logo from '../../src/images/wifi.png';
import './style.css';

export const WifiCard = (props) => {
  const { t } = useTranslation();
  const [qrvalue, setQrvalue] = useState('');

  // ** 移除了原有的 escape 函数 **
  // ** 二维码数据现在通过 props.buildWifiQrString 函数生成 **
  useEffect(() => {
    // 调用 App.js 传入的 buildWifiQrString 函数来生成二维码数据
    // 确保 buildWifiQrString 总是可用的，因为它是由父组件传递的
    if (props.buildWifiQrString) {
      const generatedQrValue = props.buildWifiQrString(props.settings);
      setQrvalue(generatedQrValue);
    }
  }, [props.settings, props.buildWifiQrString]); // 依赖 settings 和 buildWifiQrString

  const portraitWidth = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    return isMobile ? '100%' : '280px';
  };

  const passwordFieldLabel = () => {
    // 只有在非隐藏密码且有加密模式时才显示密码标签 (None 也视为有加密模式，只是密码为空)
    const hiddenPassword = props.settings.hidePassword || props.settings.encryptionMode === 'None';
    return hiddenPassword ? '' : t('wifi.password');
  };

  const eapIdentityFieldLabel = () => {
    // 只有在 WPA2-EAP 模式下才显示 EAP 身份标签
    return props.settings.encryptionMode !== 'WPA2-EAP' ? '' : t('wifi.identity');
  };

  const eapMethodFieldLabel = () => {
    // 只有在 WPA2-EAP 模式下才显示 EAP 方法标签
    return props.settings.encryptionMode !== 'WPA2-EAP' ? '' : t('wifi.encryption.eapMethod');
  };

  const qrcodeComponent = () => {
    if (props.settings.svgImage) {
      return (
        <QRCodeSVG
          className="qrcode"
          id="qrcode" // 保持 ID，以便 App.js 中的 onSaveImage 函数可以找到它
          style={{
            marginBottom: props.settings.portrait ? '1em' : '0',
            // 移除了这里的固定 width: '250px'，让 size 属性控制
          }}
          value={qrvalue}
          size={150} // 保持固定大小，或者根据需要调整
          // viewBox={`0 0 256 256`} // 可选：如果遇到渲染问题，可以尝试添加 viewBox
        />
      );
    }

    return (
      <QRCodeCanvas
        className="qrcode"
        id="qrcode" // 保持 ID，以便 App.js 中的 onSaveImage 函数可以找到它
        style={{ marginBottom: props.settings.portrait ? '1em' : '0' }}
        value={qrvalue}
        size={150} // 保持固定大小，或者根据需要调整
      />
    );
  };

  return (
    <Card
      className="card-print"
      elevation={3}
      style={{ maxWidth: props.settings.portrait ? portraitWidth() : '100%' }}
    >
      <Pane display="flex" paddingBottom={12}>
        <img alt="icon" src={logo} width="24" height="24" />
        <Heading
          size={700}
          paddingRight={10}
          paddingLeft={10}
          textAlign={props.settings.portrait ? 'center' : 'unset'}
        >
          {t('wifi.login')}
        </Heading>
      </Pane>

      <Pane
        className="details"
        style={{ flexDirection: props.settings.portrait ? 'column' : 'row' }}
      >
        {/* 调用渲染函数来显示二维码 */}
        {qrcodeComponent()}

        <Pane width={'100%'}>
          <TextareaField
            id="ssid"
            type="text"
            marginBottom={5}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength="32"
            label={t('wifi.name')}
            placeholder={t('wifi.name.placeholder')}
            value={props.settings.ssid}
            onChange={(e) => props.onSSIDChange(e.target.value)}
            isInvalid={!!props.ssidError}
            validationMessage={!!props.ssidError && props.ssidError}
            readOnly={props.isPrintMode} // 在打印模式下只读
          />
          {props.settings.encryptionMode === 'WPA2-EAP' && (
            <>
              <TextareaField
                id="eapmethod"
                type="text"
                marginBottom={5}
                readOnly={true} // 始终只读，因为目前只支持 PWD
                spellCheck={false}
                label={eapMethodFieldLabel()}
                value={props.settings.eapMethod}
              />

              <TextareaField
                id="identity"
                type="text"
                marginBottom={5}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                label={eapIdentityFieldLabel()}
                placeholder={t('wifi.identity.placeholder')}
                value={props.settings.eapIdentity}
                onChange={(e) => props.onEapIdentityChange(e.target.value)}
                isInvalid={!!props.eapIdentityError}
                validationMessage={
                  !!props.eapIdentityError && props.eapIdentityError
                }
                readOnly={props.isPrintMode} // 在打印模式下只读
              />
            </>
          )}
          {/* 密码字段的显示条件 */}
          {!(props.settings.hidePassword || props.settings.encryptionMode === 'None') && (
            <TextareaField
              id="password"
              type="text"
              maxLength="63"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              height={
                props.settings.portrait && props.settings.password.length > 40
                  ? '5em'
                  : 'auto'
              }
              marginBottom={5}
              label={passwordFieldLabel()}
              placeholder={t('wifi.password.placeholder')}
              value={props.settings.password}
              onChange={(e) => props.onPasswordChange(e.target.value)}
              isInvalid={!!props.passwordError}
              validationMessage={!!props.passwordError && props.passwordError}
              readOnly={props.isPrintMode} // 在打印模式下只读
            />
          )}
        </Pane>
      </Pane>
      {!props.settings.hideTip && (
        <>
          <hr />
          <Paragraph>
            <CameraIcon />
            <MobilePhoneIcon />
            <Text size={300} paddingRight={8} paddingLeft={8}>
              {t('wifi.tip')}
            </Text>
          </Paragraph>
        </>
      )}
    </Card>
  );
};
