apt_package "python-software-properties" do
  action :install
end

execute "add-repository-nodejs" do
  command "apt-add-repository ppa:chris-lea/node.js"
end

execute "update-apt" do
  command "apt-get update"
end

apt_package "nodejs" do
  action :install
end

apt_package "npm" do
  action :install
end

apt_package "nodejs-dev" do
  action :install
end

execute "add-key" do
  command "sudo apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10"
end

execute "add-repository-mongodb" do
  command "apt-add-repository \"deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen\""
end

execute "update-apt" do
  command "apt-get update"
end

apt_package "mongodb-10gen" do
  action :install
end

execute "npm-install" do
  command "cd /vagrant && npm install"
end