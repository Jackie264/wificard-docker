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
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import logo from '../images/wifi.png';
import './style.css';

export const WifiCard = (props) => {
  const { t } = useTranslation();
  const [qrvalue, setQrvalue] = useState('');
  const { settings, buildWifiQrString, isPrintMode, ssidError, passwordError, eapIdentityError } = props;

  useEffect(() => {
    if (buildWifiQrString) {
      const generatedQrValue = buildWifiQrString(settings);
      setQrvalue(generatedQrValue);
    }
  }, [settings, buildWifiQrString]);

  const portraitWidth = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    return isMobile ? '100%' : '280px';
  };

  const passwordFieldLabel = () => {
    const hiddenPassword = settings.hidePassword || settings.encryptionMode === 'None';
    return hiddenPassword ? '' : t('wifi.password');
  };

  const eapIdentityFieldLabel = () => {
    return settings.encryptionMode !== 'WPA2-EAP' ? '' : t('wifi.identity');
  };

  const eapMethodFieldLabel = () => {
    return settings.encryptionMode !== 'WPA2-EAP' ? '' : t('wifi.encryption.eapMethod');
  };

  const qrcodeComponent = () => {
    const qrcodeId = isPrintMode ? undefined : 'qrcode';

    if (settings.svgImage) {
      return (
        <QRCodeSVG
          className="qrcode"
          id={qrcodeId}
          style={{
            marginBottom: settings.portrait ? '1em' : '0',
          }}
          value={qrvalue}
          size={150}
        />
      );
    }

    return (
      <QRCodeCanvas
        className="qrcode"
        id={qrcodeId}
        style={{ marginBottom: settings.portrait ? '1em' : '0' }}
        value={qrvalue}
        size={150}
      />
    );
  };

  return (
    <Card
      className="card-print"
      elevation={3}
      style={{ maxWidth: settings.portrait ? portraitWidth() : '100%' }}
    >
      <Pane display="flex" paddingBottom={12}>
        <img alt="icon" src={logo} width="24" height="24" />
        <Heading
          size={700}
          paddingRight={10}
          paddingLeft={10}
          textAlign={settings.portrait ? 'center' : 'unset'}
        >
          {t('wifi.login')}
        </Heading>
      </Pane>

      <Pane
        className="details"
        style={{ flexDirection: settings.portrait ? 'column' : 'row' }}
      >
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
            value={settings.ssid}
            onChange={!isPrintMode ? (e) => props.onSSIDChange(e.target.value) : undefined}
            isInvalid={!!ssidError && !isPrintMode}
            validationMessage={!!ssidError && !isPrintMode ? ssidError : undefined}
            readOnly={isPrintMode}
          />
          {settings.encryptionMode === 'WPA2-EAP' && (
            <>
              <TextareaField
                id="eapmethod"
                type="text"
                marginBottom={5}
                readOnly={true}
                spellCheck={false}
                label={eapMethodFieldLabel()}
                value={settings.eapMethod}
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
                value={settings.eapIdentity}
                onChange={!isPrintMode ? (e) => props.onEapIdentityChange(e.target.value) : undefined}
                isInvalid={!!eapIdentityError && !isPrintMode}
                validationMessage={!!eapIdentityError && !isPrintMode ? eapIdentityError : undefined}
                readOnly={isPrintMode}
              />
            </>
          )}
          {!(settings.hidePassword || settings.encryptionMode === 'None') && (
            <TextareaField
              id="password"
              type="text"
              maxLength="63"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              height={
                settings.portrait && settings.password.length > 40
                  ? '5em'
                  : 'auto'
              }
              marginBottom={5}
              label={passwordFieldLabel()}
              placeholder={t('wifi.password.placeholder')}
              value={settings.password}
              onChange={!isPrintMode ? (e) => props.onPasswordChange(e.target.value) : undefined}
              isInvalid={!!passwordError && !isPrintMode}
              validationMessage={!!passwordError && !isPrintMode ? passwordError : undefined}
              readOnly={isPrintMode}
            />
          )}
        </Pane>
      </Pane>
      {!settings.hideTip && (
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
