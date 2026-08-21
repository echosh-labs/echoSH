setup.md - Installation and environment configuration for the Buckyball project on Ubuntu.

1. System Dependencies

Update the package manager and install core build tools:

sudo apt update && sudo apt upgrade -y

sudo apt install build-essential git curl -y

2. Go Installation

Download and install the Go binary (replace version as needed):

wget https://go.dev/dl/go1.22.0.linux-amd64.tar.gz

sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.22.0.linux-amd64.tar.gz

3. Environment Configuration

Add Go to your PATH in ~/.bashrc:

echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc

source ~/.bashrc

4. Workspace Initialization

Initialize the project structure and modules:

mkdir -p ~/buckyball/geometry

cd ~/buckyball

go mod init echosh-labs.com/buckyball

5. Execution

Compile and run the integration file:

go run main.go