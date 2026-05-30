// 敌人模板补充 - 生化易界各层敌人新增
export const EXTRA_ENEMIES = {
  // 生化敌人新增 (10-30层使用)
  bio: [
    { name: '病毒变异体', icon: '🦠', hp: 50, atk: 12, subject: 'bio', knowledge: 'RNA病毒在复制中发生错配突变，产生耐药性变异株。' },
    { name: '耐药菌株', icon: '🧫', hp: 65, atk: 15, subject: 'bio', knowledge: '携带NDM-1金属β-内酰胺酶的超级细菌，对碳青霉烯类抗生素耐药。' },
    { name: '线粒体损伤者', icon: '🔋', hp: 55, atk: 13, subject: 'bio', knowledge: '线粒体DNA缺失导致氧化磷酸化障碍，细胞能量衰竭。' },
    { name: '癌细胞增殖体', icon: '👾', hp: 80, atk: 18, subject: 'bio', knowledge: 'p53抑癌基因双等位基因失活，细胞周期检查点失效，无限增殖。' },
    { name: '免疫逃逸者', icon: '🛡️', hp: 70, atk: 16, subject: 'bio', knowledge: '通过PD-L1表达与T细胞PD-1结合，实现免疫检查点逃逸。' },
    { name: '表观遗传沉默者', icon: '🔇', hp: 60, atk: 14, subject: 'bio', knowledge: 'DNA甲基化导致抑癌基因启动子沉默，不改变序列却改变表达。' },
    { name: '蛋白错误折叠体', icon: '🌀', hp: 75, atk: 17, subject: 'bio', knowledge: '朊病毒PrP^Sc诱导PrP^C构象转变，形成淀粉样纤维传播。' },
    { name: '基因重组突变体', icon: '🔄', hp: 85, atk: 19, subject: 'bio', knowledge: '减数分裂中非同源染色体交叉互换导致染色体易位。' },
    { name: '信号通路失控者', icon: '📡', hp: 72, atk: 16, subject: 'bio', knowledge: 'RAS-MAPK通路持续激活，导致细胞不受控分裂和迁移。' },
    { name: '端粒耗尽者', icon: '⏳', hp: 90, atk: 20, subject: 'bio', knowledge: '端粒酶活性缺失导致端粒缩短，细胞进入衰老或凋亡。' },
    { name: '自噬缺陷体', icon: '🗑️', hp: 68, atk: 15, subject: 'bio', knowledge: 'ATG基因突变导致自噬流阻断，受损蛋白和细胞器积累。' },
    { name: '氧化应激体', icon: '💥', hp: 78, atk: 18, subject: 'bio', knowledge: 'ROS过量产生超过抗氧化防御，造成脂质过氧化和DNA损伤。' },
    { name: '神经退行体', icon: '🧠', hp: 82, atk: 19, subject: 'bio', knowledge: 'Tau蛋白过度磷酸化形成神经原纤维缠结，导致神经元死亡。' },
    { name: '代谢综合征体', icon: '⚖️', hp: 88, atk: 20, subject: 'bio', knowledge: '胰岛素抵抗导致糖脂代谢紊乱，肥胖、高血压、高血糖并发。' },
    { name: '细胞凋亡逃避者', icon: '💀', hp: 95, atk: 22, subject: 'bio', knowledge: 'Bcl-2过表达抑制线粒体途径凋亡，细胞获得不死特性。' }
  ],
  // 化学敌人新增 (10-30层使用)
  chem: [
    { name: '自由基链反应体', icon: '⚡', hp: 55, atk: 14, subject: 'chem', knowledge: 'Cl·自由基引发烷烃链式取代，链引发-传递-终止三步进行。' },
    { name: '配位饱和体', icon: '🔗', hp: 65, atk: 16, subject: 'chem', knowledge: '中心金属离子配位数达到饱和，配体交换反应受阻。' },
    { name: '酸碱缓冲体', icon: '⚖️', hp: 70, atk: 15, subject: 'chem', knowledge: 'Henderson-Hasselbalch方程控制的缓冲体系，pH稳定在pKa±1。' },
    { name: '过电位体', icon: '🔌', hp: 75, atk: 17, subject: 'chem', knowledge: '电极反应活化极化导致实际电位偏离平衡电位，需额外能量驱动。' },
    { name: '晶格缺陷体', icon: '🔲', hp: 80, atk: 18, subject: 'chem', knowledge: 'Schottky缺陷和Frenkel缺陷导致离子晶体导电性增强。' },
    { name: '手性异构体', icon: '🔃', hp: 60, atk: 15, subject: 'chem', knowledge: '对映异构体除旋光性外物理性质相同，但生物活性可能截然不同。' },
    { name: '胶体聚沉体', icon: '💧', hp: 72, atk: 16, subject: 'chem', knowledge: 'ζ电位降低导致胶粒排斥能垒消失，电解质引发聚沉。' },
    { name: '反应坐标能垒', icon: '⛰️', hp: 85, atk: 19, subject: 'chem', knowledge: '过渡态理论中活化配合物位于势能面鞍点，决定反应速率。' },
    { name: '熵增混沌体', icon: '🌪️', hp: 90, atk: 20, subject: 'chem', knowledge: '孤立系统自发过程向熵增方向进行，ΔS_univ>0。' },
    { name: '共振杂化体', icon: '〰️', hp: 68, atk: 16, subject: 'chem', knowledge: '苯的π电子离域形成共振杂化体，键长均等化，稳定性增加。' },
    { name: '电负性差异体', icon: '⚡', hp: 78, atk: 18, subject: 'chem', knowledge: 'Pauling电负性差>1.7时形成离子键，<1.7形成共价键。' },
    { name: '溶度积边界体', icon: '🔢', hp: 82, atk: 19, subject: 'chem', knowledge: 'Q=Ksp时达到沉淀溶解平衡，Q>Ksp沉淀生成，Q<Ksp溶解。' },
    { name: 'Markovnikov规则体', icon: '➡️', hp: 74, atk: 17, subject: 'chem', knowledge: '不对称烯烃加成时，H加在含H较多的碳上，形成较稳定碳正离子。' },
    { name: '勒夏特列逆反体', icon: '↔️', hp: 88, atk: 20, subject: 'chem', knowledge: '改变平衡条件，系统向减弱这种改变的方向移动——但无法完全抵消。' },
    { name: '轨道对称禁阻体', icon: '🚫', hp: 95, atk: 22, subject: 'chem', knowledge: 'Woodward-Hoffmann规则控制电环化反应，加热和光照条件下选择不同的轨道对称性。' }
  ],
  // 易学敌人新增 (10-30层使用)
  yi: [
    { name: '六冲煞', icon: '💢', hp: 60, atk: 15, subject: 'yi', knowledge: '六冲为子午、丑未、寅申、卯酉、辰戌、巳亥，代表冲突与变动。' },
    { name: '六害劫', icon: '🐍', hp: 70, atk: 16, subject: 'yi', knowledge: '六害为子未、丑午、寅巳、卯辰、申亥、酉戌，暗中相害，防不胜防。' },
    { name: '三刑狱', icon: '⛓️', hp: 75, atk: 17, subject: 'yi', knowledge: '三刑：寅巳申无恩之刑，丑戌未恃势之刑，子卯无礼之刑，辰午酉亥自刑。' },
    { name: '空亡虚', icon: '🌫️', hp: 65, atk: 15, subject: 'yi', knowledge: '空亡为旬中无禄之地，吉神空亡则不吉，凶神空亡亦不凶。' },
    { name: '伏吟局', icon: '🔁', hp: 80, atk: 18, subject: 'yi', knowledge: '伏吟为爻动而变出相同地支，事多反复，进少退多，宜静不宜动。' },
    { name: '反吟局', icon: '🔀', hp: 72, atk: 16, subject: 'yi', knowledge: '反吟为爻动而变出相冲地支，事多反复，吉凶皆不稳定。' },
    { name: '太岁压', icon: '👑', hp: 85, atk: 19, subject: 'yi', knowledge: '太岁为当年地支，犯太岁者（值、冲、刑、害）多有不顺。' },
    { name: '月破击', icon: '🌙', hp: 68, atk: 16, subject: 'yi', knowledge: '月建冲克爻为月破，月破之爻如同月缺，力量大减。' },
    { name: '日辰克', icon: '☀️', hp: 78, atk: 17, subject: 'yi', knowledge: '日辰为当日地支，日辰克用神则当日事多阻碍。' },
    { name: '动化退', icon: '⏮️', hp: 82, atk: 18, subject: 'yi', knowledge: '动爻化出同类但退位（如化出卯化寅），为化退，事渐消减。' },
    { name: '动化绝', icon: '💀', hp: 90, atk: 20, subject: 'yi', knowledge: '动爻化出绝地（如亥化辰），为化绝，事多终结，不可强求。' },
    { name: '游魂卦', icon: '👻', hp: 74, atk: 17, subject: 'yi', knowledge: '游魂卦为第八宫第七卦，心神不宁，多主外出、漂泊、心思不定。' },
    { name: '归魂卦', icon: '🏠', hp: 76, atk: 17, subject: 'yi', knowledge: '归魂卦为第八宫第八卦，主回归、静止、事将有成或终了。' },
    { name: '用神墓', icon: '⚰️', hp: 88, atk: 20, subject: 'yi', knowledge: '用神入墓（如木入未墓），力量被收藏，待冲开墓库方可发力。' },
    { name: '忌神旺', icon: '👹', hp: 95, atk: 22, subject: 'yi', knowledge: '忌神旺相持世或临用神，事多阻碍，如求官遇子孙持世。' }
  ]
};
