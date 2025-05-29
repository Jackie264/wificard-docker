import { Button, Heading, Link, Pane, Paragraph } from 'eververgreen-ui';
import React, { useEffect, useRef, useState, useCallback } from 'react'; // 引入 useCallback
import { useTranslation } from 'react-i18next';
import logo from '../src/images/wifi.png';
import { Settings } from './components/Settings';
import { WifiCard } from './components/WifiCard';
import './style.css';
import { Translations } from './translations';

function App() {
  const html = document.querySelector('html');
  const { t, i18n } = useTranslation();
  const firstLoad = useRef(true);
  const [settings, setSettings] = useState({
    // Network SSID name
    ssid: '',
    // Network password
    password: '',
    // Settings: Network encryption mode
    // 新增 'None' 选项，表示开放网络
    encryptionMode: 'WPA',
    // Settings: EAP Method
    eapMethod: 'PWD', // 默认 PWD
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
    svgImage: true, // 保持用户选择的SVG或Canvas模式
  });
  const [errors, setErrors] = useState({
    ssidError: '',
    passwordError: '',
    eapIdentityError: '',
  });

  // --- 二维码数据构建与特殊字符转义函数 ---
  /**
   * 转义WiFi SSID或密码中的特殊字符，以符合ZXing WiFi二维码标准。
   * 特殊字符包括：\ (反斜杠), ; (分号), : (冒号), , (逗号), " (双引号)
   * @param {string} str 需要转义的字符串
   * @returns {string} 转义后的字符串
   */
  const escapeSpecialChars = useCallback((str) => {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\') // 转义反斜杠
              .replace(/;/g, '\\;')  // 转义分号
              .replace(/:/g, '\\:')  // 转义冒号
              .replace(/,/g, '\\,')  // 转义逗号
              .replace(/"/g, '\\"'); // 转义双引号
  }, []); // 依赖为空，函数只创建一次

  /**
   * 根据WiFi设置构建标准WiFi二维码字符串。
   * 格式: WIFI:S:<SSID>;T:<encryption>;P:<password>;H:<hidden>;;
   * @param {object} currentSettings 当前WiFi设置对象
   * @returns {string} 适用于二维码的WiFi字符串
   */
  const buildWifiQrString = useCallback((currentSettings) => {
    const { ssid, password, encryptionMode, hiddenSSID } = currentSettings;

    const escapedSsid = escapeSpecialChars(ssid);
    const escapedPassword = escapeSpecialChars(password);

    let qrData = `WIFI:S:${escapedSsid};`;
    let encryptionType = '';
    let passwordField = '';

    // 处理加密类型和密码
    if (encryptionMode === 'WPA') {
      encryptionType = 'WPA';
      passwordField = `P:${escapedPassword};`;
    } else if (encryptionMode === 'WEP') {
      encryptionType = 'WEP';
      passwordField = `P:${escapedPassword};`;
    } else if (encryptionMode === 'None') { // 开放网络
      encryptionType = 'nopass';
      passwordField = ''; // 开放网络没有密码字段
    } else if (encryptionMode === 'WPA2-EAP') {
      // WPA2-EAP 是一种企业级加密，标准WiFi二维码格式不支持其详细配置（如EAP方法和身份）。
      // 微信和iOS相机通常只支持个人版（WPA/WEP/nopass）。
      // 这里将其映射为 'WPA' 类型并包含密码。
      // 请注意：这种编码方式无法让扫码应用自动配置EAP认证信息，可能需要用户手动设置。
      encryptionType = 'WPA';
      passwordField = `P:${escapedPassword};`;
    }

    qrData += `T:${encryptionType};`;
    qrData += passwordField;

    // 处理隐藏SSID
    if (hiddenSSID) {
      qrData += `H:true;`;
    }

    qrData += `;;`; // 确保以双分号结尾，这是标准格式的强制要求

    return qrData;
  }, [escapeSpecialChars]); // 依赖 escapeSpecialChars
  // --- 二维码数据构建与特殊字符转义函数结束 ---


  const htmlDirection = useCallback((languageID) => {
    languageID = languageID || i18n.language;
    const rtl = Translations.filter((t) => t.id === languageID)[0]?.rtl;
    return rtl ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const onChangeLanguage = useCallback((language) => {
    html.style.direction = htmlDirection(language);
    i18n.changeLanguage(language);
  }, [html, htmlDirection, i18n]);

  const onPrint = useCallback(() => {
    // 打印前再次检查输入有效性
    if (!settings.ssid.length) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        ssidError: t('wifi.alert.name'),
      }));
      return;
    }
    // 密码长度验证
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
    // WPA2-EAP 的密码和身份验证
    if (settings.encryptionMode === 'WPA2-EAP') {
        if (settings.password.length < 1) { // 密码不能为空
            setErrors((prevErrors) => ({
                ...prevErrors,
                passwordError: t('wifi.alert.password'),
            }));
            return;
        }
        if (settings.eapIdentity.length < 1) { // EAP 身份不能为空
            setErrors((prevErrors) => ({
                ...prevErrors,
                eapIdentityError: t('wifi.alert.eapIdentity'),
            }));
            return;
        }
        // 对于WPA2-EAP，在这里可以额外添加用户提示，告知二维码可能无法直接连接
        // 例如：alert(t('wifi.alert.wpa2eap_qr_warning'));
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
    // 如果选择 'None'，则清空密码
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
    if (!isNaN(amount) && amount >= 0) {
        setSettings((prevSettings) => ({ ...prevSettings, additionalCards: amount }));
    }
  }, []);

  const onHideTipChange = useCallback((hideTip) => {
    setSettings((prevSettings) => ({ ...prevSettings, hideTip }));
  }, []);

  // 移除了 App 组件内部的 onFirstLoad，由 useEffect 统一管理
  const handleFirstLoadLogic = useCallback(() => {
    if (firstLoad.current) {
        html.style.direction = htmlDirection();
        firstLoad.current = false;
    }
  }, [html, htmlDirection]);

  const onSaveImage = useCallback(() => {
    // 确保二维码元素存在且可见
    const qrcodeElement = document.getElementById('qrcode');
    if (!qrcodeElement) {
        console.error("QR code element not found for saving image.");
        return;
    }

    if (settings.svgImage) {
      // 从 SVG 元素中获取内容并下载
      const svg = qrcodeElement.cloneNode(true); // 克隆 SVG 元素
      // 移除可能影响下载的样式或ID
      svg.style = null;
      svg.removeAttribute('class');
      svg.removeAttribute('id');

      let svgSource = new XMLSerializer().serializeToString(svg);
      // 确保 SVG 头部有 xmlns 属性，防止某些浏览器下载后无法正确显示
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
      downloadLink.download = `${settings.ssid || 'wifi-qrcode'}.svg`; // 默认文件名

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      URL.revokeObjectURL(svgUrl); // 释放 URL 对象
      return;
    }

    // 处理 Canvas 下载
    // 确保 qrcodeElement 是一个 canvas 元素
    if (qrcodeElement.tagName.toLowerCase() !== 'canvas') {
      console.error("QR code element is not a canvas when trying to save as PNG.");
      return;
    }

    qrcodeElement.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);

        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `${settings.ssid || 'wifi-qrcode'}.png`; // 默认文件名

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        URL.revokeObjectURL(url); // 释放 URL 对象
      } else {
        console.error("Failed to create blob from canvas.");
      }
    });
  }, [settings.svgImage, settings.ssid]);


  useEffect(() => {
    // 确保页面方向在首次加载时正确设置
    handleFirstLoadLogic();
    // 确保页面方向在语言变化时也正确设置
    html.style.direction = htmlDirection();
  }, [html, htmlDirection, handleFirstLoadLogic, i18n.language]); // 添加 i18n.language 依赖


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
          <Link href="https://github.com/Chocobo1/wifi-card-svg" target="_blank" rel="noopener noreferrer">
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
          // 传递 buildWifiQrString 函数给 WifiCard 组件
          buildWifiQrString={buildWifiQrString}
        />
      </Pane>

      <Settings
        settings={settings}
        // 传递 handleFirstLoadLogic 代替原来的 onFirstLoad
        onFirstLoad={handleFirstLoadLogic}
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
        marginTop={20} // 增加按钮上边距
        onClick={onPrint}
      >
        {t('button.print')}
      </Button>
      <Button
        id="saveImage"
        appearance="primary"
        height={40}
        marginRight={16}
        marginTop={20} // 增加按钮上边距
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
              // 打印区域的卡片不需要显示错误或接收 onChange 事件
              // 但它们仍需要 buildWifiQrString 来生成二维码
              buildWifiQrString={buildWifiQrString}
              isPrintMode={true} // 可以添加此 prop 以便 WifiCard 在打印模式下调整样式或行为
            />
          ))}
      </Pane>
    </Pane>
  );
}

export default App;
