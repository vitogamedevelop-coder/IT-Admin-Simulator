/**
 * Isolated demo fixture for the generic `guided-ui` exercise type.
 *
 * This is NOT productive academy content. It lives in scripts/test-data and is
 * only imported by the regression test to verify the exercise type works.
 */
export const guidedUiDemoExercise = {
  id: 'demo-guided-ui-server-manager',
  type: 'guided-ui',
  title: 'Demo: Server Manager Navigation',
  intro: 'Technische Demonstration: Klicke im Server Manager die richtigen Menüs, um zur Rolleninstallation zu gelangen.',
  steps: [
    {
      id: 'demo-step-dashboard',
      title: 'Dashboard',
      kind: 'navigation',
      instruction: 'Du willst eine neue Rolle installieren. Welches Menü wählst du im Server Manager?',
      screen: { title: 'Server Manager', subtitle: 'Dashboard' },
      targets: [
        { id: 'manage', label: 'Manage', ui: 'menu-item', description: 'Verwaltungsmenü' },
        { id: 'tools', label: 'Tools', ui: 'menu-item', description: 'Werkzeuge öffnen' },
        { id: 'view', label: 'View', ui: 'menu-item', description: 'Ansicht ändern' },
      ],
      correctTarget: 'manage',
      feedbackCorrect: 'Richtig. Über das Manage-Menü erreichst du die Optionen zur Rollen- und Feature-Installation.',
      feedbackWrong: 'Das öffnet die lokale Serverübersicht bzw. das Werkzeugmenü. Für Rolleninstallationen brauchst du das Verwaltungsmenü (Manage).',
      explanation: 'Im Server Manager führt der Weg über Manage zu Add Roles and Features.',
    },
    {
      id: 'demo-step-manage',
      title: 'Manage-Menü',
      kind: 'navigation',
      instruction: 'Das Manage-Menü ist geöffnet. Wohin klickst du, um Rollen hinzuzufügen?',
      screen: { title: 'Server Manager', subtitle: 'Manage' },
      targets: [
        { id: 'add-roles', label: 'Add Roles and Features', ui: 'menu-item' },
        { id: 'remove-roles', label: 'Remove Roles and Features', ui: 'menu-item' },
        { id: 'add-servers', label: 'Add Servers', ui: 'menu-item' },
      ],
      correctTarget: 'add-roles',
      feedbackCorrect: 'Korrekt. Add Roles and Features startet den Installations-Assistenten.',
      feedbackWrong: 'Das würde Rollen entfernen oder Server zur Verwaltungsliste hinzufügen. Für eine neue Installation wählst du Add Roles and Features.',
      explanation: 'Der Installationsassistent führt durch die Auswahl der Serverrolle.',
    },
    {
      id: 'demo-step-install-type',
      title: 'Installation Type',
      kind: 'decision',
      instruction: 'Der Assistent fragt nach der Installationsart. Was wählst du für einen einzelnen lokalen Server?',
      screen: { title: 'Add Roles and Features Wizard', subtitle: 'Select installation type' },
      targets: [
        { id: 'role-based', label: 'Role-based or feature-based installation', ui: 'radio' },
        { id: 'scenario', label: 'Scenario-based installation', ui: 'radio' },
        { id: 'rd', label: 'Remote Desktop Services installation', ui: 'radio' },
      ],
      correctTarget: 'role-based',
      feedbackCorrect: 'Richtig. Role-based or feature-based installation ist die Standardauswahl für Active Directory Domain Services.',
      feedbackWrong: 'Scenario-based oder RDS sind spezialisierte Assistenten. Für AD DS ist die rollenbasierte Installation der richtige Weg.',
      explanation: 'Role-based installation ermöglicht die Auswahl einzelner Serverrollen wie AD DS.',
    },
  ],
};
