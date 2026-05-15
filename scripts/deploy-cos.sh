#!/bin/bash
# ============================================
# 腾讯云 COS 部署脚本
# 自动构建 + 上传静态文件到对象存储
# ============================================

set -e

# ====== 彩色输出 ======
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

log_info()  { echo -e "${CYAN}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step()  { echo -e "\n${BOLD}${GREEN}▸ $1${NC}"; }

# ====== 配置 ======
# 从环境变量读取，或在此处硬编码（不推荐）
COS_BUCKET="${COS_BUCKET:-}"
COS_REGION="${COS_REGION:-ap-guangzhou}"
COS_SECRET_ID="${COS_SECRET_ID:-}"
COS_SECRET_KEY="${COS_SECRET_KEY:-}"
BUILD_DIR="out"

# ====== 检查环境 ======
log_step "1/5 检查环境"

if [ -z "$COS_BUCKET" ] || [ -z "$COS_SECRET_ID" ] || [ -z "$COS_SECRET_KEY" ]; then
  log_error "缺少 COS 配置，请设置以下环境变量："
  echo "  export COS_BUCKET=your-bucket-1250000000"
  echo "  export COS_REGION=ap-guangzhou"
  echo "  export COS_SECRET_ID=AKIDxxxxxxxx"
  echo "  export COS_SECRET_KEY=xxxxxxxx"
  exit 1
fi

# 检查 coscli
if ! command -v coscli &> /dev/null; then
  log_warn "未安装 coscli，正在安装..."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    curl -fsSL https://cosbrowser.cloud.tencent.com/software/coscli/coscli-mac -o /usr/local/bin/coscli
    chmod +x /usr/local/bin/coscli
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    curl -fsSL https://cosbrowser.cloud.tencent.com/software/coscli/coscli-linux -o /usr/local/bin/coscli
    chmod +x /usr/local/bin/coscli
  else
    log_error "请手动安装 coscli: https://cloud.tencent.com/document/product/436/63144"
    exit 1
  fi
  log_ok "coscli 安装成功"
fi

log_ok "环境检查通过"

# ====== 安装依赖 ======
log_step "2/5 安装依赖"

if [ ! -d "node_modules" ]; then
  npm install --silent
  log_ok "依赖安装完成"
else
  log_ok "依赖已存在，跳过"
fi

# ====== 构建项目 ======
log_step "3/5 构建项目"

npm run build 2>&1 | tail -5
if [ ! -d "$BUILD_DIR" ]; then
  log_error "构建失败，未找到 ${BUILD_DIR} 目录"
  exit 1
fi

FILE_COUNT=$(find "$BUILD_DIR" -type f | wc -l | tr -d ' ')
TOTAL_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
log_ok "构建完成: ${FILE_COUNT} 个文件, 总大小 ${TOTAL_SIZE}"

# ====== 配置 coscli ======
log_step "4/5 配置 COS"

export COSCLI_SECRET_ID="$COS_SECRET_ID"
export COSCLI_SECRET_KEY="$COS_SECRET_KEY"

COS_PATH="cos://${COS_BUCKET}"
log_ok "目标: ${COS_PATH} (${COS_REGION})"

# ====== 上传文件 ======
log_step "5/5 上传文件到 COS"

# 同步上传，自动设置 Content-Type，删除远端多余文件
coscli sync "$BUILD_DIR/" "${COS_PATH}/" \
  -r "${COS_REGION}" \
  --delete \
  --thread-num 10 \
  2>&1 | while IFS= read -r line; do
    if echo "$line" | grep -q "SUCCESS\|success\|Upload"; then
      echo -e "  ${GREEN}✓${NC} $line"
    elif echo "$line" | grep -q "ERROR\|error\|FAIL"; then
      echo -e "  ${RED}✗${NC} $line"
    else
      echo "  $line"
    fi
  done

# 设置 HTML 文件缓存策略
log_info "设置缓存策略..."
coscli sync "$BUILD_DIR/" "${COS_PATH}/" \
  -r "${COS_REGION}" \
  --include "*.html" \
  --meta "Cache-Control:no-cache,max-age=0" \
  2>/dev/null || true

# 设置静态资源长缓存
coscli sync "$BUILD_DIR/_next/" "${COS_PATH}/_next/" \
  -r "${COS_REGION}" \
  --meta "Cache-Control:public,max-age=31536000,immutable" \
  2>/dev/null || true

log_ok "缓存策略设置完成"

# ====== 完成 ======
echo ""
echo -e "${BOLD}${GREEN}============================================${NC}"
echo -e "${BOLD}${GREEN}  ✅ 部署成功！${NC}"
echo -e "${BOLD}${GREEN}============================================${NC}"
echo ""
echo -e "  ${CYAN}Bucket:${NC}  ${COS_BUCKET}"
echo -e "  ${CYAN}Region:${NC}  ${COS_REGION}"
echo -e "  ${CYAN}Files:${NC}   ${FILE_COUNT}"
echo -e "  ${CYAN}Size:${NC}    ${TOTAL_SIZE}"
echo -e "  ${CYAN}URL:${NC}     https://${COS_BUCKET}.cos-website.${COS_REGION}.myqcloud.com"
echo ""
