import { Button, Heading, Link, Pane, Paragraph } from 'evergreen-ui';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import logo from '../src/images/wifi.png';
import { Settings } from './components/Settings';
import { WifiCard } from './components/WifiCard';
import './style.css';
import { Translations } from './translations';

function App() {
  const htmlRef = useRef(null);

  const { t, i18n } = useTranslation();
  // const firstLoad = useRef(true);

  const [settings, setSettings] = useState({
    // Network SSID name
    ssid: '',
    // Network password
    password: '',
    // Settings: Network encryption mode
    encryptionMode: 'WPA',
    // Settings: EAP Method
    eapMethod: 'PWD',
    // Settings: EAP identity
    eapIdentity: '',
    // Settings: Hide password on the printed card
    hidePassword: false,
    // Settings: Mark your network as hidden SSID
    hiddenSSID: false,
    // Settings: Portrait orientation
    portrait: false,
    // Settings: Additional cards
    additionalCards: 0,
    // Settings: Show tip (legend) on card
    hideTip: false,
    // Settings: Show QR code in svg format
    svgImage: true,
  });
  const [errors, setErrors] = useState({
    ssidError: '',
    passwordError: '',
    eapIdentityError: '',
  });

  const escapeSpecialChars = useCallback((str) => {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/:/g, '\\:')
      .replace(/,/g, '\\,')
      .replace(/"/g, '\\"');
  }, []);

  const buildWifiQrString = useCallback((currentSettings) => {
    const { ssid, password, encryptionMode, hiddenSSID } = currentSettings;

    const escapedSsid = escapeSpecialChars(ssid);
    const escapedPassword = escapeSpecialChars(password);

    let qrData = `WIFI:S:${escapedSsid};`;
    let encryptionType = '';
    let passwordField = '';

    if (encryptionMode === 'WPA') {
      encryptionType = 'WPA';
      passwordField = `P:${escapedPassword};`;
    } else if (encryptionMode === 'WEP') {
      encryptionType = 'WEP';
      passwordField = `P:${escapedPassword};`;
    } else if (encryptionMode === 'None') {
      encryptionType = 'nopass';
      passwordField = '';
    } else if (encryptionMode === 'WPA2-EAP') {
      encryptionType = 'WPA';
      passwordField = `P:${escapedPassword};`;
      qrData += `E:${currentSettings.eapMethod};`;
      qrData += `I:${escapeSpecialChars(currentSettings.eapIdentity)};`;
    }

    qrData += `T:${encryptionType};`;
    qrData += passwordField;

    if (hiddenSSID) {
      qrData += `H:true;`;
    }

    qrData += `;;`;

    return qrData;
  }, [escapeSpecialChars]);

  const htmlDirection = useCallback((languageID) => {
    languageID = languageID || i18n.language;
    const rtl = Translations.filter((t) => t.id === languageID)[0]?.rtl;
    return rtl ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const onChangeLanguage = useCallback((language) => {
    if (htmlRef.current) {
      htmlRef.current.style.direction = htmlDirection(language);
    }
    i18n.changeLanguage(language);
  }, [htmlDirection, i18n]);

  const onPrint = useCallback(() => {
    if (!settings.ssid.length) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        ssidError: t('wifi.alert.name'),
      }));
      return;
    }
    if (settings.encryptionMode === 'WPA' && settings.password.length < 8) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        passwordError: t('wifi.alert.password.length.8'),
      }));
      return;
    }
    if (settings.encryptionMode === 'WEP' && settings.password.length < 5) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        passwordError: t('wifi.alert.password.length.5'),
      }));
      return;
    }
    if (settings.encryptionMode === 'WPA2-EAP') {
      if (settings.password.length < 1) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          passwordError: t('wifi.alert.password'),
        }));
        return;
      }
      if (settings.eapIdentity.length < 1) { //
        setErrors((prevErrors) => ({
          ...prevErrors,
          eapIdentityError: t('wifi.alert.eapIdentity'),
        }));
        return;
      }
    }

    document.title = 'WiFi Card - ' + settings.ssid;
    window.print();
  }, [settings, t]);

  const onSSIDChange = useCallback((ssid) => {
    setErrors((prevErrors) => ({ ...prevErrors, ssidError: '' }));
    setSettings((prevSettings) => ({ ...prevSettings, ssid }));
  }, []);

  const onPasswordChange = useCallback((password) => {
    setErrors((prevErrors) => ({ ...prevErrors, passwordError: '' }));
    setSettings((prevSettings) => ({ ...prevSettings, password }));
  }, []);

  const onEncryptionModeChange = useCallback((encryptionMode) => {
    setErrors((prevErrors) => ({ ...prevErrors, passwordError: '' }));
    if (encryptionMode === 'None') {
      setSettings((prevSettings) => ({ ...prevSettings, encryptionMode, password: '' }));
    } else {
      setSettings((prevSettings) => ({ ...prevSettings, encryptionMode }));
    }
  }, []);

  const onEapMethodChange = useCallback((eapMethod) => {
    setSettings((prevSettings) => ({ ...prevSettings, eapMethod }));
  }, []);

  const onEapIdentityChange = useCallback((eapIdentity) => {
    setErrors((prevErrors) => ({ ...prevErrors, eapIdentityError: '' }));
    setSettings((prevSettings) => ({ ...prevSettings, eapIdentity }));
  }, []);

  const onOrientationChange = useCallback((portrait) => {
    setSettings((prevSettings) => ({ ...prevSettings, portrait }));
  }, []);

  const onSvgImageChange = useCallback((svgImage) => {
    setSettings((prevSettings) => ({ ...prevSettings, svgImage }));
  }, []);

  const onHidePasswordChange = useCallback((hidePassword) => {
    setSettings((prevSettings) => ({ ...prevSettings, hidePassword }));
  }, []);

  const onHiddenSSIDChange = useCallback((hiddenSSID) => {
    setSettings((prevSettings) => ({ ...prevSettings, hiddenSSID }));
  }, []);

  const onAdditionalCardsChange = useCallback((additionalCardsStr) => {
    const amount = parseInt(additionalCardsStr, 10);
    // if (!/^\d*$/.test(additionalCardsStr)) { return; }
    if (!isNaN(amount) && amount >= 0) {
      setSettings((prevSettings) => ({ ...prevSettings, additionalCards: amount }));
    }
  }, []);

  const onHideTipChange = useCallback((hideTip) => {
    setSettings((prevSettings) => ({ ...prevSettings, hideTip }));
  }, []);

  const onSaveImage = useCallback(() => {
    const qrcodeElement = document.getElementById('qrcode');
    if (!qrcodeElement) {
      console.error("QR code element not found for saving image.");
      return;
    }

    if (settings.svgImage) {
      const svg = qrcodeElement.cloneNode(true);
      svg.style = null;
      svg.removeAttribute('class');
      svg.removeAttribute('id');

      let svgSource = new XMLSerializer().serializeToString(svg);
      if (
        !svgSource.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)
      ) {
        svgSource = svgSource.replace(
          /^<svg/,
          '<svg xmlns="http://www.w3.org/2000/svg"'
        );
      }

      const svgBlob = new Blob([svgSource], {
        type: 'image/svg+xml; charset=utf-8',
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `${settings.ssid || 'wifi-qrcode'}.svg`;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      URL.revokeObjectURL(svgUrl);
      return;
    }

    if (qrcodeElement.tagName.toLowerCase() !== 'canvas') {
      console.error("QR code element is not a canvas when trying to save as PNG.");
      return;
    }

    qrcodeElement.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);

        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `${settings.ssid || 'wifi-qrcode'}.png`;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        URL.revokeObjectURL(url);
      } else {
        console.error("Failed to create blob from canvas.");
      }
    });
  }, [settings.svgImage, settings.ssid]);


  useEffect(() => {
    htmlRef.current = document.querySelector('html');

    if (htmlRef.current) {
      htmlRef.current.style.direction = htmlDirection();
    }

  }, [htmlDirection, i18n.language]);

  return (
    <Pane display="flex" flexDirection="column" padding={20}>
      <Pane display="flex" alignItems="center" marginBottom={20}>
        <img alt="icon" src={logo} width="32" height="32" />
        <Heading size={900} paddingRight={16} paddingLeft={16}>
          {t('title')}
        </Heading>
      </Pane>

      <Pane marginBottom={20}>
        <Paragraph marginTop={12}>{t('desc.use')}</Paragraph>

        <Paragraph marginTop={12}>
          {t('desc.privacy')}{' '}
          <Link href="https://github.com/Jackie264/wificard-docker" target="_blank" rel="noopener noreferrer">
            {t('desc.source')}
          </Link>
          .
        </Paragraph>
      </Pane>

      {/* 主 WiFi 卡片，用于显示和用户输入 */}
      <Pane marginBottom={20}>
        <WifiCard
          settings={settings}
          ssidError={errors.ssidError}
          passwordError={errors.passwordError}
          eapIdentityError={errors.eapIdentityError}
          onSSIDChange={onSSIDChange}
          onEapIdentityChange={onEapIdentityChange}
          onPasswordChange={onPasswordChange}
          buildWifiQrString={buildWifiQrString}
        />
      </Pane>

      <Settings
        settings={settings}
        onLanguageChange={onChangeLanguage}
        onEncryptionModeChange={onEncryptionModeChange}
        onEapMethodChange={onEapMethodChange}
        onOrientationChange={onOrientationChange}
        onHidePasswordChange={onHidePasswordChange}
        onHiddenSSIDChange={onHiddenSSIDChange}
        onAdditionalCardsChange={onAdditionalCardsChange}
        onHideTipChange={onHideTipChange}
        onSvgImageChange={onSvgImageChange}
      />

      <Button
        id="print"
        appearance="primary"
        height={40}
        marginRight={16}
        marginTop={20}
        onClick={onPrint}
      >
        {t('button.print')}
      </Button>
      <Button
        id="saveImage"
        appearance="primary"
        height={40}
        marginRight={16}
        marginTop={20}
        onClick={onSaveImage}
      >
        {t('button.saveImage')}
      </Button>
      <Pane id="print-area" display="flex" flexWrap="wrap" justifyContent="center">
        {settings.additionalCards >= 0 &&
          [...Array(settings.additionalCards + 1)].map((el, idx) => (
            <WifiCard
              key={`card-nr-${idx}`}
              settings={settings}
              buildWifiQrString={buildWifiQrString}
              isPrintMode={true}
            />
          ))}
      </Pane>
    </Pane>
  );
}

export default App;
