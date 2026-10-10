include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-wan-traffic
PKG_VERSION:=1.4.0
PKG_RELEASE:=1
PKG_LICENSE:=MIT
PKG_LICENSE_FILES:=LICENSE
PKG_MAINTAINER:=cndoin
PKGARCH:=all

include $(INCLUDE_DIR)/package.mk

define Package/luci-app-wan-traffic
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=Fluxora - persistent WAN traffic observatory
  URL:=https://github.com/cndoin/luci-app-fluxora
  DEPENDS:=+luci-base +rpcd +rpcd-mod-file +uci +ubus +jsonfilter
endef

define Package/luci-app-wan-traffic/description
  Fluxora is a lightweight LuCI dashboard for persistent WAN accounting,
  trends, billing periods, live rates and quotas. One package for ARM and x86.
endef

define Build/Compile
endef

define Package/luci-app-wan-traffic/conffiles
/etc/config/wan_traffic
endef

define Package/luci-app-wan-traffic/install
	$(CP) ./root/* $(1)/
	chmod 0755 $(1)/etc/init.d/wan-traffic $(1)/usr/libexec/wan-traffic-*
	$(INSTALL_DATA) ./LICENSE $(1)/usr/share/doc/luci-app-wan-traffic/LICENSE
endef

define Package/luci-app-wan-traffic/postinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] && exit 0
/etc/init.d/wan-traffic enable
/etc/init.d/wan-traffic restart
rm -f /tmp/luci-indexcache
/etc/init.d/rpcd restart
exit 0
endef

define Package/luci-app-wan-traffic/prerm
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] && exit 0
/etc/init.d/wan-traffic stop
/etc/init.d/wan-traffic disable
exit 0
endef

$(eval $(call BuildPackage,luci-app-wan-traffic))
