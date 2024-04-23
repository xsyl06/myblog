---
title: Redis单机版搭建
order: 1
index: true
date: 2024-04-19
category:
  - Redis
tag:
  - Redis
---

## 1、安装gcc

```shell
yum install -y gcc
```

## 2、下载redis

```shell
wget http://download.redis.io/releases/redis-5.0.9.tar.gz
tar -zxvf redis-5.0.9.tar.gz
cd redis-5.0.9.tar.gz
```

## 3、编译安装

```shell
make
```

## 4、修改配置文件

```shell
cp redis.conf redis.conf.default
vim redis.conf

修改以下配置

daemonize yes #后台启动
protected-mod no #关闭保护模式，开启的话，只有本机才可以访问
#需要注释掉bind
#bind 127.0.0.1
```

## 5、启动redis服务

```shell
#启动服务
src/redis-server redis.conf

#验证服务是否启动成功
ps -ef |grep redis

#进入redis客户端
src/redis-cli
```

‍
