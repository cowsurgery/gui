# $FreeBSD$

PORTNAME=	freenas-10gui
PORTVERSION=	${PRODUCT_VERSION:C/\-.*//:C/\_.*//}
PORTREVISION=	${REVISION}

CATEGORIES=	freenas
VALID_CATEGORIES+=	freenas

MAINTAINER=	dev@ixsystems.com
COMMENT=	FreeNAS UI

EXTRACT_ONLY=

FETCH_DEPENDS=	npm>0:${PORTSDIR}/www/npm \
		gmake:${PORTSDIR}/devel/gmake \
		git>0:${PORTSDIR}/devel/git
RUN_DEPENDS=	npm>0:${PORTSDIR}/www/npm
BUILD_DEPENDS=	rsync>0:${PORTSDIR}/net/rsync

NO_BUILD=	yes
WRKSRC?=	/usr/freenas_gui_src

checksum:
	${ECHO_CMD} ${.TARGET} not needed because building direct

fetch:
	${MKDIR} ${WRKDIR}
	(cd ${WRKSRC} && ${LOCALBASE}/bin/npm install svg-typewriter@1.0.2 --legacy-bundling --ignore-scripts && \
		cd node_modules/svg-typewriter && \
		${LOCALBASE}/bin/node -e "var p=require('./package.json'); delete p.dependencies['@types/d3']; require('fs').writeFileSync('./package.json', JSON.stringify(p,null,2))" && \
		cd ${WRKSRC} && ${LOCALBASE}/bin/npm install --production --legacy-bundling)
	(cd ${WRKSRC} && ${LOCALBASE}/bin/npm install typescript@2.2.2 postcss postcss-cssnext postcss-import --legacy-bundling)
	(cd ${WRKSRC} && ./node_modules/.bin/tsc || true)
	(cd ${WRKSRC} && ${LOCALBASE}/bin/node -e '\
		var postcss = require("postcss"); \
		var cssnext = require("postcss-cssnext"); \
		var postcssImport = require("postcss-import"); \
		var fs = require("fs"); \
		var path = require("path"); \
		var execSync = require("child_process").execSync; \
		var files = execSync("find ui blue-shark/ui -name \"_*.css\" -not -path \"*/node_modules/*\"", {encoding: "utf8"}).trim().split("\\n"); \
		var configPath = path.resolve("./blue-shark/ui/_config.css"); \
		var processor = postcss([postcssImport(), cssnext({warnForDuplicates: false, features: {rem: false}})]); \
		Promise.all(files.map(function(file) { \
			var dir = path.dirname(file); \
			var outPath = path.join(dir, path.basename(file).substring(1)); \
			var css = fs.readFileSync(file, "utf8"); \
			var input = "@import \x27" + path.relative(dir, configPath).replace(/\\\\/g, "/") + "\x27;\\n" + css; \
			return processor.process(input, {from: path.resolve(file), to: path.resolve(outPath)}).then(function(r) { \
				fs.writeFileSync(outPath, r.css); \
			}).catch(function() { fs.writeFileSync(outPath, css); }); \
		})).then(function() { console.log("CSS done"); }); \
	')
	(cd ${WRKSRC} && mkdir -p bin/vendors/uuid/lib && \
		cp node_modules/uuid/index.js bin/vendors/uuid/index.js && \
		cp node_modules/uuid/v1.js bin/vendors/uuid/v1.js && \
		cp node_modules/uuid/v4.js bin/vendors/uuid/v4.js && \
		cp node_modules/uuid/lib/bytesToUuid.js bin/vendors/uuid/lib/bytesToUuid.js && \
		cp node_modules/uuid/lib/rng-browser.js bin/vendors/uuid/lib/rng.js)
	(cd ${WRKSRC}/serial-console-app && ${LOCALBASE}/bin/npm install)

extract:
	:

do-install:
	rsync -avl --exclude '.git' --exclude 'nas_ports' --exclude 'etc' --exclude 'sbin' ${WRKSRC}/ ${STAGEDIR}${PREFIX}/www/gui/
	mkdir -p ${STAGEDIR}${PREFIX}/www/gui/
	(cd ${STAGEDIR}${PREFIX}/www/gui; ${FIND} . -type f \
		| ${SED} -e 's,^\./,,g' \
		| ${AWK} '{print length, $$0}' | ${SORT} -rn \
		| cut -d " " -f 2- \
		| ${AWK} '{print "www/gui/"$$0 }' >> ${TMPPLIST})

.include <bsd.port.mk>
