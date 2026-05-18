import { createContext, useState, useEffect, useContext } from "react";

const LanguageContext = createContext();

const translations = {
  FR: {
    // Sidebar & Common
    tableau_de_bord: "Tableau de bord",
    commandes: "Commandes",
    toutes: "Toutes",
    abandonnees: "Abandonnées",
    clients: "Clients",
    produits: "Produits",
    entreprises: "Entreprises",
    status: "Status",
    equipe: "Équipe",
    affilies: "Affiliés",
    sources_de_commandes: "Sources de commandes",
    applications: "Applications",
    deconnexion: "Déconnexion",
    mon_agence: "Mon Agence",

    // Dashboard
    suivre_indicateurs: "Surveillez les indicateurs clés et la performance",
    total_commandes: "TOTAL COMMANDES",
    confirmees: "CONFIRMÉES",
    en_attente: "EN ATTENTE",
    annulees: "ANNULÉES",
    temps_moyen: "TEMPS MOYEN",
    taux_confirmation: "TAUX CONFIRMATION",
    performance_des_agents: "Performance des agents",
    statistiques_des_ventes: "Statistiques des ventes",
    dernieres_commandes: "Dernières commandes",
    aujourd_hui: "Aujourd'hui",
    hier: "Hier",
    ce_mois: "Ce mois",
    cette_annee: "Cette année",

    // Team & Settings
    gestion_equipe: "Gestion d'équipe",
    gerer_membres: "Gérez les membres de votre agence, leurs rôles et quotas.",
    parametres_equipe: "Paramètres de l'équipe",
    parametres_distribution: "Paramètres de distribution",
    ajouter_membre: "Ajouter un membre",
    assigner_produits: "Assigner des produits",
    role: "Rôle",
    statut: "Statut",
    actions: "Actions",
    admin: "Administrateur",
    agent: "Agent",
    actif: "Actif",
    inactif: "Inactif",
    quota_journalier: "Quota journalier",
    dispatch_auto: "Dispatch Auto",
    commission: "Commission",
    connexion_as: "Se connecter en tant que",
    modifier: "Modifier",
    supprimer: "Supprimer",
    sauvegarder: "Sauvegarder",
    annuler: "Annuler",
    devise: "Devise",
    strategie_inactif: "Stratégie d'inactivité",
    ne_rien_faire: "Ne rien faire",
    redistribuer: "Redistribuer aux agents actifs",
    transferer: "Transférer à un agent spécifique",

    // Help Center / Documentation
    help_title: "Centre d'aide",
    help_intro: "Dans FlashManager, les quotas et commissions font partie des fonctionnalités de gestion d'équipe qui vous aident à gérer vos agents efficacement.",
    help_quotas_title: "Quotas",
    help_quotas_text: "Cette fonctionnalité vous permet de définir une limite sur le nombre de commandes qu'un agent peut traiter au cours d'une certaine période. Lorsque vous activez la distribution automatique (Auto-Dispatch), les nouvelles commandes sont attribuées aux agents en fonction de leurs quotas. Par exemple, si un agent a un quota de 50, il recevra des commandes jusqu'à ce qu'il atteigne cette limite, puis le système passera à l'agent suivant.",
    help_commissions_title: "Commissions",
    help_commissions_text: "Cette fonctionnalité vous permet de configurer le paiement de vos agents en fonction de leurs performances. Vous pouvez définir :",
    help_commission_type: "Type de commission : si l'agent est payé lorsqu'une commande est confirmée ou livrée.",
    help_commission_mode: "Mode de commission : si le paiement est un montant fixe par commande ou un pourcentage du total de la commande.",
    help_commission_amount: "Montant : la valeur ou le pourcentage spécifique qui sera crédité sur le portefeuille de l'agent lorsque sa condition de commission est remplie.",
    help_conclusion: "Ces fonctionnalités permettent de motiver vos agents et de gérer efficacement leur charge de travail. Si vous devez les définir ou les ajuster, vous pouvez le faire dans la section Équipe.",
  },
  EN: {
    // Sidebar & Common
    tableau_de_bord: "Dashboard",
    commandes: "Orders",
    toutes: "All",
    abandonnees: "Abandoned",
    clients: "Customers",
    produits: "Products",
    entreprises: "Companies",
    status: "Status",
    equipe: "Team",
    affilies: "Affiliates",
    sources_de_commandes: "Order Sources",
    applications: "Applications",
    deconnexion: "Logout",
    mon_agence: "My Agency",

    // Dashboard
    suivre_indicateurs: "Monitor key metrics and performance",
    total_commandes: "TOTAL ORDERS",
    confirmees: "CONFIRMED",
    en_attente: "PENDING",
    annulees: "CANCELLED",
    temps_moyen: "AVERAGE TIME",
    taux_confirmation: "CONFIRMATION RATE",
    performance_des_agents: "Agent Performance",
    statistiques_des_ventes: "Sales Statistics",
    dernieres_commandes: "Recent Orders",
    aujourd_hui: "Today",
    hier: "Yesterday",
    ce_mois: "This month",
    cette_annee: "This year",

    // Team & Settings
    gestion_equipe: "Team Management",
    gerer_membres: "Manage your agency members, their roles, and daily quotas.",
    parametres_equipe: "Team Settings",
    parametres_distribution: "Distribution Settings",
    ajouter_membre: "Add Member",
    assigner_produits: "Assign Products",
    role: "Role",
    statut: "Status",
    actions: "Actions",
    admin: "Administrator",
    agent: "Agent",
    actif: "Active",
    inactif: "Inactive",
    quota_journalier: "Daily quota",
    dispatch_auto: "Auto Dispatch",
    commission: "Commission",
    connexion_as: "Login as",
    modifier: "Edit",
    supprimer: "Delete",
    sauvegarder: "Save",
    annuler: "Cancel",
    devise: "Currency",
    strategie_inactif: "Inactive Strategy",
    ne_rien_faire: "Do nothing",
    redistribuer: "Redistribute to active agents",
    transferer: "Transfer to a specific agent",

    // Help Center / Documentation
    help_title: "Help Center",
    help_intro: "In FlashManager, quotas and commissions are part of the team management features that help you manage your agents effectively.",
    help_quotas_title: "Quotas",
    help_quotas_text: "This feature allows you to set a limit on the number of orders an agent can handle within a certain period. When you turn on Auto-Dispatch, new orders are assigned to agents based on their quotas. For example, if an agent has a quota of 50, they will receive orders until they reach that limit, and then the system will move to the next agent.",
    help_commissions_title: "Commissions",
    help_commissions_text: "This feature allows you to set up payment for your agents based on their performance. You can define:",
    help_commission_type: "Commission type: Whether the agent gets paid when an order is Confirmed or Delivered.",
    help_commission_mode: "Commission mode: Whether the payment is a fixed amount per order or a percentage of the order total.",
    help_commission_amount: "Amount: The specific value or percentage that will be credited to the agent's wallet when their commission condition is met.",
    help_conclusion: "These features help incentivize your agents and manage their workload efficiently. If you need to set or adjust these, you can do so in the Team section.",
  },
  AR: {
    // Sidebar & Common
    tableau_de_bord: "لوحة التحكم",
    commandes: "الطلبات",
    toutes: "الكل",
    abandonnees: "المتروكة",
    clients: "الزبائن",
    produits: "المنتجات",
    entreprises: "الشركات",
    status: "الحالات",
    equipe: "الفريق",
    affilies: "الشركاء",
    sources_de_commandes: "مصادر الطلبات",
    applications: "التطبيقات",
    deconnexion: "تسجيل الخروج",
    mon_agence: "وكالتي",

    // Dashboard
    suivre_indicateurs: "مراقبة المؤشرات الرئيسية والأداء",
    total_commandes: "إجمالي الطلبات",
    confirmees: "المؤكدة",
    en_attente: "في الانتظار",
    annulees: "الملغية",
    temps_moyen: "متوسط الوقت",
    taux_confirmation: "معدل التأكيد",
    performance_des_agents: "أداء الوكلاء",
    statistiques_des_ventes: "إحصائيات المبيعات",
    dernieres_commandes: "أحدث الطلبات",
    aujourd_hui: "اليوم",
    hier: "أمس",
    ce_mois: "هذا الشهر",
    cette_annee: "هذه السنة",

    // Team & Settings
    gestion_equipe: "إدارة الفريق",
    gerer_membres: "إدارة أعضاء وكالتك، أدوارهم وحصصهم اليومية.",
    parametres_equipe: "إعدادات الفريق",
    parametres_distribution: "إعدادات التوزيع",
    ajouter_membre: "إضافة عضو",
    assigner_produits: "تعيين المنتجات",
    role: "الدور",
    statut: "الحالة",
    actions: "الإجراءات",
    admin: "مدير",
    agent: "وكيل",
    actif: "نشط",
    inactif: "غير نشط",
    quota_journalier: "الحصة اليومية",
    dispatch_auto: "التوزيع التلقائي",
    commission: "العمولة",
    connexion_as: "تسجيل الدخول كـ",
    modifier: "تعديل",
    supprimer: "حذف",
    sauvegarder: "حفظ",
    annuler: "إلغاء",
    devise: "العملة",
    strategie_inactif: "إستراتيجية الخمول",
    ne_rien_faire: "لا تفعل شيئاً",
    redistribuer: "إعادة التوزيع على الوكلاء النشطين",
    transferer: "نقل إلى وكيل معين",

    // Help Center / Documentation
    help_title: "مركز المساعدة",
    help_intro: "في FlashManager، تعتبر الحصص والعمولات جزءًا من ميزات إدارة الفريق التي تساعدك على إدارة وكلاءك بفعالية.",
    help_quotas_title: "الحصص (Quotas)",
    help_quotas_text: "تتيح لك هذه الميزة تحديد حد أقصى لعدد الطلبات التي يمكن للوكيل التعامل معها خلال فترة معينة. عند تشغيل التوزيع التلقائي (Auto-Dispatch)، يتم تعيين الطلبات الجديدة للوكلاء بناءً على حصصهم. على سبيل المثال، إذا كان لدى الوكيل حصة قدرها 50، فسيتلقى الطلبات حتى يصل إلى هذا الحد، ثم ينتقل النظام إلى الوكيل التالي.",
    help_commissions_title: "العمولات (Commissions)",
    help_commissions_text: "تتيح لك هذه الميزة إعداد الدفع لوكلائك بناءً على أدائهم. يمكنك تحديد:",
    help_commission_type: "نوع العمولة: ما إذا كان الوكيل يتقاضى أجره عند تأكيد الطلب أو تسليمه.",
    help_commission_mode: "وضع العمولة: ما إذا كان الدفع مبلغاً ثابتاً لكل طلب أو نسبة مئوية من إجمالي الطلب.",
    help_commission_amount: "المبلغ: القيمة المحددة أو النسبة المئوية التي سيتم إضافتها إلى محفظة الوكيل عند استيفاء شرط العمولة الخاص به.",
    help_conclusion: "تساعد هذه الميزات في تحفيز وكلائك وإدارة عبء العمل الخاص بهم بكفاءة. إذا كنت بحاجة إلى ضبط أو تعديل هذه الميزات، يمكنك القيام بذلك في قسم الفريق.",
  }
};

export default function LanguageProvider({ children }) {
  // Load preferred language from localStorage, fallback to 'FR'
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("preferred_language") || "FR";
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem("preferred_language", lang);
  };

  useEffect(() => {
    // Add RTL class to document body if Arabic is selected, for professional styling!
    if (language === "AR") {
      document.body.classList.add("rtl-layout");
      document.body.setAttribute("dir", "rtl");
    } else {
      document.body.classList.remove("rtl-layout");
      document.body.removeAttribute("dir");
    }
  }, [language]);

  const t = (key) => {
    if (!translations[language]) return key;
    return translations[language][key] || translations["FR"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
