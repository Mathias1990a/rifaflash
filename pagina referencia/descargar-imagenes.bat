@echo off
chcp 65001
echo ==========================================
echo DESCARGADOR DE IMÁGENES - SEGURIDADPRO
echo ==========================================
echo.
echo Este script descargará las imágenes necesarias
echo para que la página funcione OFFLINE
echo.
echo Presiona cualquier tecla para comenzar...
pause > nul

REM Crear carpeta images si no existe
if not exist "images" mkdir "images"

echo.
echo Descargando imágenes de productos Dahua...
echo.

REM Productos Dahua
curl -L -o "images/dahua-bullet-2mp.png" "https://www.dahuasecurity.com/asset/upload/uploads/soft/20210105/HAC-HFW1200R-Z-IRE6.png"
echo ✓ Dahua Bullet 2MP

curl -L -o "images/dahua-bullet-4k.png" "https://www.dahuasecurity.com/asset/upload/uploads/soft/20210225/HAC-HFW1801T-Z-A.png"
echo ✓ Dahua Bullet 4K

curl -L -o "images/dahua-dome-4mp.png" "https://www.dahuasecurity.com/asset/upload/uploads/soft/20201110/HDBW2431E-S-S2.png"
echo ✓ Dahua Dome 4MP

curl -L -o "images/dahua-ptz-25x.png" "https://www.dahuasecurity.com/asset/upload/uploads/soft/20181229/SD49225T-HN.png"
echo ✓ Dahua PTZ 25x

curl -L -o "images/dahua-wifi-3mp.png" "https://www.dahuasecurity.com/asset/upload/uploads/soft/20210105/IPC-HDBW1320E-W.png"
echo ✓ Dahua WiFi 3MP

curl -L -o "images/dahua-colorvu-4mp.png" "https://www.dahuasecurity.com/asset/upload/uploads/soft/20210225/HAC-HFW1409TLM-A-LED.png"
echo ✓ Dahua ColorVu 4MP

echo.
echo Descargando imágenes de instalaciones...
echo.

REM Cercos eléctricos
curl -L -o "images/cerco-instalacion-1.jpg" "https://www.stafix.co.za/wp-content/uploads/2019/08/Electric-Fence-Installation.jpg"
echo ✓ Cerco instalación 1

curl -L -o "images/cerco-instalacion-2.jpg" "https://www.nemteck.co.za/wp-content/uploads/2021/03/Electric-Fence-Installation-Johennesburg.jpg"
echo ✓ Cerco instalación 2

curl -L -o "images/sistema-integrado.jpg" "https://www.smartsecurityclub.com/wp-content/uploads/2021/06/electric-fence-and-cctv.jpg"
echo ✓ Sistema integrado

curl -L -o "images/seguridad-completa.jpg" "https://www.securico.co.zw/wp-content/uploads/2020/01/Security-Systems.jpg"
echo ✓ Seguridad completa

curl -L -o "images/camaras-sistema.jpg" "https://www.dahuasecurity.com/asset/upload/uploads/soft/20230818/Security-Camera-System.jpg"
echo ✓ Sistema de cámaras

curl -L -o "images/camara-tioc.png" "https://www.dahuasecurity.com/asset/upload/uploads/soft/20210520/TiOC-Camera.png"
echo ✓ Cámara TiOC

echo.
echo ==========================================
echo DESCARGA COMPLETADA
echo ==========================================
echo.
echo Las imágenes se guardaron en la carpeta 'images/'
echo.
echo Presiona cualquier tecla para salir...
pause > nul
