#!/bin/bash
echo "--- 1. Configurando repositorio de NVIDIA ---"
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
  sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

echo "--- 2. Instalando el Toolkit ---"
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit

echo "--- 3. Configurando Docker ---"
sudo nvidia-ctk runtime configure --runtime=docker

echo "--- 4. Reiniciando Docker ---"
sudo systemctl restart docker

echo "✅ ¡Listo! Ahora ya puedes ejecutar el contenedor."
