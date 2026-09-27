# 纸之魔女 (Paper Witch) — HANDOFF (APPEND ONLY, never overwrite)

## 用户约束 / 偏好
- 风格：素描线稿，只用黑白（人物和背景都一样）。所有美术素材都用内置生图工具生成。
- 镜头：类似饥荒，但角度更低，能看到远景；可以旋转视角（每个角色需要 5 个朝向：正面 / 3/4 正面 / 侧面 / 3/4 背面 / 背面）。
- 男主：黑发青年恶魔，有角。用户不喜欢 A（痞帅风衣）和 B（野性少年）。要的是【平静、高冷、可爱、正常】的感觉。候选：C（立领风衣），D（衬衫 + 马甲 + 斗篷 + 书）——尚未选定。
- 女主：用户选了 A（金色长卷发、大尖帽、围裙、扫帚，接近魔理沙的感觉，但是原创设计）。
- 变身：折纸方式——压平成纸 → 折起来 → 再展开成新形态。形态：狗 / 独角兽 / 鸟。
- 比例：Q版和正常比例都想看看效果（游戏内按 P 切换）。
- 玩法：探索 + 变身解谜。
- 游戏必须是单个 index.html，双击就能玩（素材以 base64 形式内嵌）。

## 文件
- index.html = 构建出来的可玩版本（不要手动改）。源码：game_src.html；python3 build.py 会把 assets/*.png 内嵌进去。
- concepts/ = 生成的原始设定图；cut.py 把设定图切成 assets/（泛洪填充处理成透明背景；5 个朝向按列切分；动物用网格切分）。
- concept_board.html = 给用户看的设定图画板。

## v0.1 沙盒 (2026-09-27)
- 伪 3D 相机（yaw/pitch 可调，透视投影，远景全景图用镜像拼接做成圆柱背景），纸片人精灵，按深度排序，遮挡时树木半透明，纸张纹理。
- 5 个朝向的选择：viewOf()；每张设定图的 sideDir 表示侧面图原本朝向哪边。
- 谜题：狗在 X 土堆挖出星星，独角兽冲撞石阵，鸟飞过河。恶魔跟随她，偶尔说句冷淡的台词，被河隔开时会用纸屑瞬移过去。
- 按键：WASD/点击移动，Q/E 或右键拖动旋转视角，滚轮缩放，1-4 切换形态，空格 动作，P 切换比例，C 切换恶魔方案。

---
## 仓库 / 流程（2026-09-27，用户新增的约束 —— 必须遵守）
- 仓库：github.com/deawfwaef2/mari3dcity（token 由用户在聊天里提供；不要提交到仓库）。工作区重置后要重新 clone，推送前先看一下 `git log origin/main`。
- 要经常、分阶段地推送（用户那边的网站可能出 bug 回退）。每次提交都必须是能玩的版本：根目录 index.html 双击就能打开（素材 base64 内嵌）。先打包 HTML，再做细节打磨。
- 工作区 < 128MB。本文件（HANDOFF）只能追加，不能覆盖；每次写代码前先读一遍。
- 测试：用 playwright 跑 `__game` 钩子（start / transform / toggleProp / toggleDemon / hero / STARS / RING / MOUND）。沙盒里安装的 pip 包不会被保存 → 每次都要重新安装 playwright。

## 反馈 第 2 轮 → v0.2
- 用户选定了恶魔 **D**（衬衫 + 领结 + 马甲 + 短斗篷 + 书）。外观调整：**耳朵两侧要有垂下来的发丝**，**头发更尖**。→ concepts/demon_D2_chibi.png、demon_D2_normal.png（底部的文字已裁掉 → *_clean）；assets demon_D2_*；游戏里默认用 `demonD2`（C 键可以切换成原版 D 做对比）。
- 性格：**不释放善意、以自我为中心、冷淡、贬低她、利用她**（把她当跑腿的，把星星据为己有）。女主开朗，形成反差。所有恶魔台词都照这个方向改了（DEMON_IDLE、变身时的评价、对话、过河、胜利后的三段对话）。闲着的时候他背对她看书，只偶尔冷冷地瞥她一眼。
- 保持这个人设不要变：不要写温暖或安慰的台词。

---
## 反馈 第 3 轮 → v0.3（2026-09-27）
用户原话（摘要）：
- 垂发要的是【软条感】：只要一缕细细的、柔软的发丝，**不是更多头发**。表情**不要严肃**，要冷淡、慵懒、带一点居高临下的笑。→ D3：concepts/demon_D3_*.png，assets demon_D3_*，游戏里默认用 `demonD3`（C 键可以和原版 D 对比）。D2 已弃用（头发太多、表情太凶）。
- 关系：**恶魔地位很高，女主地位像狗**。剧情：恶魔用契约/黑色的书**洗脑控制了女主，把她变成自己的仆人**。女主叫他「主人」，开心又顺从；他把她当宠物使唤（「好狗」「乖」「狗就该有狗的样子」），把她找到的东西全部据为己有。保持非色情、适合游戏的基调。
- **加入饥荒元素**。
### v0.3 已完成
- 三项数值：生命 / 饱食 / 理智（在 canvas 上画的圆形计量表）。昼夜循环 DAY_LEN=260 秒（白天 <0.55，黄昏，夜晚 0.7–0.93，黎明）。黑暗覆盖层（半分辨率离屏画布 + 在营火/火把位置挖出光圈），恶魔的眼睛在黑暗里发光。
- 夜里没有光超过 2.2 秒 → 被“黑暗里的东西”攻击（−16 生命 / 2 秒，画面周围有潦草的影子在转）。
- 采集（只有人形能采集）：浆果丛（90 秒再生）、草（60 秒）、蘑菇（150 秒）、地上散落的树枝/燧石；装备斧头后可以砍树（3 下 → 树桩 + 木头）。
- 物品栏 10 格（点击：吃 / 装备 / 在营火旁添柴）。制作：火把（干草 2 + 树枝 2，燃烧 80 秒）、斧头（树枝 1 + 燧石 1）、营火（干草 3 + 木头 2，放在脚下）、烤浆果（浆果 2，需要站在营火旁）。
- 主人的命令（顶部黑框）：浆果 ×4 → 生火 → 3 颗星星（原来的三个谜题，现在要献给主人）→ 之后从命令池里循环。完成命令：理智 +18，被夸奖，女主「主人夸我了……！」。
- 理智低 → 画面暗角 + 女主想起一点过去的自己（「我……以前是谁？」），恶魔立刻打断（「别想多余的事」）= 洗脑的主题。理智 <15 → 掉血。
- 死亡：在主人身边重生，每种物品数量减半，他会说「……没用的东西。起来。」
- 测试钩子：__game.S / fires / gitems / invAdd / craft / RECIPES / useSlot。测试脚本在仓库外的 ~/dev/pt*.py（会丢失；需要时重写）。
### 下一步想法
- 冬天/季节、夜里的敌人（影子怪、狼）、储物箱、烹饪锅、狗形态能嗅出资源、更多地图区域、真正的走路帧。
- 空间提示：仓库的 .git 大约 42MB，而且还在增长（每次提交 index.html 约 2MB）。工作区接近 128MB 时，可以删掉本地 clone，再用 `git clone --depth 1` 重新 clone。截图请放到 ~/shots，用完就删。

## 第 4 轮（v0.4）
### 用户反馈
- 恶魔头发：侧边软发丝要更**粗**；发尖要尖，但整体只有**一种统一的朝向**。表情：**完全不笑**，冷淡、无视。
- **不要照搬饥荒**。改做更细致的**物品收集系统**（这一条取代了“加入饥荒元素”）。
- 洗脑已经**彻底完成**：她被当作狗使唤，主人偶尔下达**调教命令**。内容保持非性化；她的台词只有全心的忠诚，没有自我怀疑。
### 美术
- concepts/demon_D4_chibi.png（Q版，默认）、demon_D4_tall.png（正常比例）、demon_D4alt_chibi.png（备选，头发较乱）。
- 收藏图标：col_nature / col_treasure / col_relic（各 4×3），由 cut.py 切成 assets/col_*_0..11。
- build.py 不再打包 demon_C / D2 / D3，以减小体积。C 键在 D4 和 D 之间切换。
### 已删除（生存玩法）
- 生命、饱食、理智、黑暗伤害、死亡、营火、火把、斧头、烤浆果。
- 昼夜只保留视觉：黑暗最多 0.45，她身边有一圈光。夜晚会刷出月光花和萤火虫。
### 收藏系统（game_src.html 中的 COLLECTION 模块）
- COL 共 38 件，分为：花草 / 虫 / 矿石 / 埋藏物 / 高处与河 / 她的旧物 / 特别（星星）。稀有度：普通 1、稀有 3、珍贵 8、传说 20 分。
- 各形态的搜集方式：
  - 人形：采花；用捕虫网（树枝3+干草2）捕虫；站在河边用网打捞（RIVER_TAB）。
  - 狗：空格嗅一嗅，显示 13 格内的埋藏点，持续 22 秒；再挖出来（BURIED_TAB）。
  - 独角兽：冲撞碎石堆或大石头（ROCK_TAB / BOULDER_TAB），石头 160 秒后重生。
  - 鸟：飞到高树上的鸟巢按空格（NEST_TAB），冷却 150–210 秒。
- 采集篮（干草6+树枝3）把收藏袋从 10 格扩到 16 格。掉在地上的物品，走过去就会自动捡起。
- 站在主人身边按空格 → 献上袋里所有收藏 → 「主人的鉴定」面板：逐件显示评语、分数和新收藏标记。
  - 分数倍率 = 0.6 + 服从度/100；首次献上 ×2。
  - 「她的旧物」会被主人销毁，她说：「不认识，主人要就拿去吧」。
- 身份等级（按满意度）：流浪狗 / 看门狗 / 猎犬 / 忠犬 / 主人的爱犬。收齐一整类 +30。
- 今日献礼：每天 3 条（genQuota），全部完成 +15。三颗星星全部献上 = 胜利横幅。
- 收藏目录：B 键或按钮打开。分类标签页；没找到的显示剪影，找到未献上显示虚线框；点击格子看线索和主人评语。打开目录或鉴定面板时游戏暂停。
### 调教命令（ORDERS）
- 每 45–80 秒随机下达一条：
  - 过来
  - 坐下（变成狗，不动 2 秒）
  - 别动（4 秒）
  - 叼回来（他扔出树枝，狗叼回来）
  - 绕我转一圈
  - 变成鸟飞给我看
- 成功：服从度 +6、满意度 +2，冷淡的夸奖。失败：服从度 −8，冷冷地骂「笨狗」。
- 画面上方有 #order 横幅和计时条。
### 测试
- ~/dev/pt5.py 覆盖完整流程：采花 / 做网 / 捕虫 / 嗅挖 / 撞石 / 鸟巢 / 献上 / 目录 / 命令 / 夜晚。
- __game 钩子：S、flora、bugs、digs、deliverAll、issueOrder、openCatalog、COL 等。
### 下一步想法
- 收藏柜场景（把献上的东西陈列出来）、稀有天气事件、每类收齐后解锁新区域或新命令、主人偶尔“赏赐”。

## 第 5 轮（v0.5）
### 用户反馈
- 男主**不跟随**女主，要有自己的行为逻辑。女主可以**请求**他跟随。靠近男主可以获取命令和互动。
- 男主头发：**黑发**，耳边的发丝更软，整体要有“大包感”（蓬松、有体积）。**不要非 Q 版**，全部只用 Q 版。
- **女主不说话**：参考《上古卷轴》，屏幕上没有女主的聊天气泡，玩家通过对话选项替她说话。
- 男主语言：更冷淡，带点贬低。
- **不要虫子**。
- 台词风格：从用户提供的聊天记录中理想化提炼。冷淡的一方映射为男主，热情、黏人的一方映射为女主。**不照抄原句，不写入任何真实个人信息。**
- 开场剧情：做成动画 CG。两人原本住在古宅，为了搜集神器，穿过传送门来到纸之界，然后开始探索、建造基地。
### 人设（重要，写台词前先看）
- **男主（恶魔，被称为「主人」）**
  - 外观：D5（Q版）。黑色蓬松的头发，耳边垂着软软的粗发束；小角、尖耳；衬衫配领结、马甲、短披风；手里拿书，身后有尾巴。
  - 性格：冷淡，以自我为中心，谁都不需要（“我谁都不需要搭理。……因为不需要。”）。嫌她烦、懒得理她，只在自己需要的时候才开口。
  - 说话方式：
    - 句子很短，常用省略号起句。
    - 常用这类词：「吵。」「说。」「有空再理你。」「懒得搭理你。」「……无聊。」「别在我视线里晃。」
    - 贬低她：「笨狗」「废物」「智商不太行的宠物」。点评她的东西很刻薄：「线条歪歪扭扭，粗细不匀」。
    - 夸奖极少，而且会马上补一句冷话：「……还行。别得意。」
    - 威胁要扔掉她：「没用的东西，我随时会扔。」
    - 偶尔有一点点温度（碰一下她的头又立刻收回），然后马上变冷。
  - 禁止：大笑、温柔长句、主动关心她、任何性暗示。
- **女主（纸之魔女）**
  - 外观：A（Q版）。长卷金发，大帽子上有蝴蝶结，穿围裙裙，拿扫帚。能折纸变身为狗、独角兽、鸟。
  - 性格：已被完全洗脑，把他当主人。热情、黏人、真诚，想帮他，怕被丢下，对他言听计从。自己的过去（旧物）对她毫无意义。
  - **她从不出声，没有气泡。** 她的台词只出现在对话选项里。选项风格举例：
    - 「主人……能陪我一起走走吗？」
    - 「主人要多出去走走，一直闷着不好的。」
    - 「主人需要什么，我都会给你找来。」
    - 「主人……不要丢下我。」
    - 「我手很巧的，可以帮主人做很多事！」
    - （悄悄蹭了蹭主人的手）
  - 游戏里的提示信息一律用系统提示条（note）显示，不用她的嘴说。
### 实现
- **男主 AI（demonAI）**
  - 状态：read / walk / look / sleep / follow。
    - read：去看书的地方看书，建了扶手椅就坐在椅子上。
    - walk / look：在营地 17 格范围内闲逛、端详东西。
    - sleep：夜里如果有帐篷，就进去睡觉（显示 z）。
    - follow：跟随她，持续 90–150 秒，时间到了就说「够了，自己去」。
  - 距离她 12 格以上时，他只会下达“过来”这一条命令，而且频率降低。
- **对话（Skyrim 式，按 1–9 选择或点击；打开时游戏暂停）**
  - 在他身边按空格打开。根节点的选项：
    - 献上收藏
    - 有什么吩咐（55% 当场下命令）
    - 请求跟随（成功率 = 0.25 + 服从度/200 + 身份等级×0.08；被拒绝后冷却 60 秒）/ 让他回去休息
    - 住下 / 建造提示
    - 星星进度
    - 闲聊
    - 离开
  - TOPICS 共 19 个闲聊话题，每天不重复，部分有二级分支；少数选项会让服从度或满意度 +1。
- **开场（CUT，共 5 幅 CG：cg_1..5）**：古宅夜景 → 书房（他在看书，她跪在一旁）→ 黑书里的「星辰罗盘」和三颗纸星 → 大厅镜中的纸页漩涡（他把她拽进去）→ 纸之界，石门碎裂，回去的路断了。
  - 画面有 Ken Burns 推拉，字幕逐字打出；点击或空格继续；只有 SKIP 按钮能跳过全部；__game.start() 直接跳过开场。
- **建造（G）**：只能在石门营地（BASE (-1,2)）16 格范围内建造，而且要人形。空格放下，Esc 取消。
  - 扶手椅（木4 石2）：他坐着看书。
  - 帐篷（草8 枝6 木2）：他夜里在里面睡觉。
  - 收藏柜（木6 石4 燧石2）：陈列献上的前 6 件珍品；在旁边按空格翻看收藏目录。
  - 狗窝（木3 枝4 草2）：夜里变成狗在里面按空格，直接睡到天亮。
  - 路灯（石2 燧石2 枝2，最多 6 盏）：夜里照亮周围。
- 材料：独角兽撞碎石堆掉石头和矿物，撞倒枯树或树桩掉木头；树枝和干草在地上捡。燧石改为材料，不再算收藏。
- 已删除：所有虫子（5 种）、比例切换（P 键）、正常比例的立绘。收藏总数改为 32 件。
- 测试：~/dev/pt6.py（开场 / 对话 / 跟随 / 建造 / 夜晚）。
- 空间：concepts/ 用 sparse-checkout 隐藏，本地不显示。需要重新切图时，先运行 `git sparse-checkout disable`，用完再运行 `git sparse-checkout set --no-cone '/*' '!/concepts/'`。沙盒重置后 .git/config 会丢失：需要重新设置 remote、user，以及 sparse-checkout 的规则。

## 第 6 轮（v0.6）
### 用户反馈 → 要求
- 男主头发不对：参考用户上传的图（圆润的 bob 头），**只借用它的「发包」**：圆润、成块的发束。仍然是黑发。
- **不要再生成 CG**。开场改成游戏内的单位动画过场，像魔兽争霸 3 的关卡过场那样。
- 开局不要一次解锁太多机制。**每个机制绑定一件道具**（具体设计交给我）。
- 基础 UI 要非常简洁。
- 命令太粗糙，要做得更丰富。
- 多研究聊天记录。
- 不要一直随机冒对话气泡，很尴尬。
### 实现
- **美术**：demon_D6_chibi（concepts/demon_D6b_chibi.png，用 cut6.py 切图）：圆润成块的发包 bob，侧发向内卷到下巴。设为默认。
  - key_0..7（项圈、螺旋角、黑羽笔、小木槌、牵绳、黑色手册、星辰罗盘、银哨）。
  - man_0..3（书架、落地镜、烛台、落地钟）。
  - 已删除 cg_1..5。build.py 不再打包 D4 和 D5。
- **开场过场（cine，生成器脚本 script()）**
  - 古宅场景在 x=300，是一个独立区域：暗色背景、木地板、后墙、地毯，书架 ×3、落地钟、镜子、烛台 ×3（有烛光），还有扶手椅。
  - 画面有黑边（letterbox），镜头会推拉，角色会走动；字幕放在下方黑边里，显示说话人名字。
  - 点击或空格 = 跳过当前这一句；**只有 SKIP 按钮能跳过整段过场**。
  - 流程：「古宅 · 深夜」标题 → 他坐着看书，她跪在一旁 → 书里的星辰罗盘（发光的特写）→ 他走到镜前，镜中出现纸页漩涡 → 他说「过来。」→ 她走过去 → 两人走进镜子 → 白光。
  - 接着到纸之界：两人从空中落下 → 石门震动后碎成一地石块（碎块上保留原来的告示文字）→「……回去的路，断了。」「搭个落脚的地方。然后，把星星找回来。」
  - __game.start() 会调用 endCine() 直接跳到结束状态。
- **道具解锁（KEYS / gainKey / 解锁卡片）**：开局只有人形和动作按钮。每得到一件道具弹出一张卡片（道具名、功能、主人的一句话），按空格关闭。
  - 收藏袋：过场结束后得到 → 显示收藏栏。
  - 黑色手册：第 1 次献上后得到 → 收藏目录 B、献礼单、身份卡。在此之前顶部只显示一条命令：「去找点东西回来」。
  - 项圈：第 2 次献上后得到 → 狗形态，以及铃铛召唤「过来」（约每 150–220 秒一次，只在距离大于 6 时触发）。
  - 银哨：第一次成功响应「过来」后得到 → 对话里出现每日「训练」。
  - 螺旋角：狗在土堆挖出星星时，一起掉落 → 独角兽形态。
  - 黑羽笔：石阵被撞开后掉落 → 鸟形态。
  - 小木槌：身份达到「看门狗」且已有手册 → 建造 G。
  - 大篮子：身份达到「猎犬」→ 收藏袋 16 格。
  - 牵绳：服从度 ≥ 60、已有项圈、献上次数 ≥ 2 → 对话里出现「请主人跟着我」。
  - 星辰罗盘：第一次献上星星后得到 → 屏幕边缘出现箭头，指向下一颗星星。
  - 捞网：放在河岸 (9, 15.7) 的地上，捡起即得 → 可以打捞。
  - 已删除：制作面板、转视角按钮、帮助长文、恶魔切换按钮。形态按钮只显示已解锁的形态。
- **命令（CMDS）**
  - 八种：过来、坐下等着（狗形态在他身边静止 6 秒）、叼回来（书签）、去拿「X」、别碰（诱饵）、站到那里（地上的虚线圈，站 5 秒）、转圈（狗形态原地转两圈）、安静（不许按空格、不许变身）。
  - 每条命令有专属的成功、慢、失败台词。
  - 每日训练：3 道命令，每道 0–3 分，总分对应评级 低等偏下 / 低等 / 中等偏下 / 中等 / 中等偏上 / 上等，并附评语。
  - 「吩咐」有 60% 概率当场下一道命令。已删除所有随机命令。
- **去掉随机气泡**：删除了 idle、闲逛、端详、黄昏台词，以及变身时的重复台词（每种形态只在第一次变身时说一句）。他现在只对事件作出反应。
- **台词**：新增 16 个话题，来自 sj2 的冷淡语气（理想化、去掉脏话），例如「我有自己的时间」「你会打扰我做任何事情」「非要你来鼓励？」「看完别人搭屋子我再来」「认识层面、理解层面」。另有问候语、营地评价，献上鉴定也会给出评级。
- 测试：~/dev/pt7.py（UI 限制、解锁、训练）、pt7b.py（道具拾取、别碰、召唤、银哨）、pc.py（过场截图）。

---
## Round 7 (v0.7) — control, core, terrain, redesign

### User requests this round
- Demon hair drifted into a girl's bob (D6 rejected). Use **D4 as the base**, replace the soft ear locks (软条) with rounded chunky hair clumps (发包) that grow out of the main hair mass, with pointed tips. Result: **D7** (`concepts/demon_D7b_chibi.png`).
- Heroine keeps her original look, but: **calm expression, mouth closed**; open collar with a **red demonic mechanical core embedded at the upper chest**. It glows and flashes and is the control device, and **the demon periodically injects magic into it**. Result: **heroine C**.
- **She cannot move freely.** She moves only when a command allows it: fetch or free-gather windows with limited range and time. Past the edge, the core flares and pulls her back. Otherwise she auto-follows him or stands waiting (罚站).
- Terrain with height; deeper interaction; many more actions and animations.

### Implementation
- **Art**: `cut7.py` is an RGBA cutter (column argmin cuts plus `force` overrides). It writes `assets/core.json` with the relative core position per sprite, used for the glow and for the demon's palm in dpose_0. Poses:
  - `hpose_0..8`: kneel, stand-wait (eyes closed), bow, offer, hands together, crouch-pick, hug knees, core glowing, walk with broom.
  - `dpose_0..3`: casting, pointing, arms crossed, sitting and reading.
  - Pose height factors are `HP_H`/`DP_H` in game_src.
- **Terrain**: `HILLS` lists flat-topped hills; `gz(x,y)` is added inside `proj()`, so everything sits on the ground. Hills are drawn with marching-squares contour lines and slope hatching (`buildTerrain`/`drawTerrain`). Height is zero near the river. There is no collision from height.
- **Control** (`ctl`, `zoneNow()`): movement input is accepted only inside a zone. Zones come from:
  - Orders (`ORDER_ZONE`).
  - Director tasks: free, gather, dig, smash, fly, and camp (camp while he reads, if he chooses it).
  
  Otherwise `heroAuto()` drives her in one of these modes: follow, return, wait (罚站), kneel, rest, offer, held, stay. At the zone edge, `clampZone` pulls her back with a core flare and a small core drain. Player transforms and actions outside a zone call `resist()`, and she crosses the river automatically as a bird.
- **Director** (`demonAI` → `nextAgenda` → `runStep`). The demon runs a plan of steps: walk, say, task, read, wait, cmd, train, appraise, sleep, inject.
  - Story beats are chosen automatically: first free gather → appraisal (notebook) → collar → mound dig → horn → ring smash → quill → fly for star 3.
  - A failed task leads to 罚站 as punishment.
- **Core**: `S.core` drains over time, faster inside zones. Below 30 he injects: he walks to her, uses dpose_0, and a red beam runs from his palm to her core while she is in hpose_7. The core gauge is at top right. Low core shrinks task zones.
- **Dialogue**: new options are "can I go look for things myself" (a chance-based free gather) and, with the **leash**, "can you take me there" (river, nearest hill, camp). Talking during 罚站 is refused and costs obedience.
- **Bug fixes**:
  - v0.6 hid ALL world props after the cinematic, because `MAN_ON` was the number 0 compared with `!==` against a bool.
  - The cinematic's boulder fade was never reset.
  - The core glow went NaN during the cinematic.

### Pending / ideas
- Height does not block movement yet (cliffs and ramps could be added as blocking contour edges).
- hpose_8 (walk with broom) is unused.
