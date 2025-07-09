import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Equipment } from '../types';

// Déclaration pour TypeScript
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Export Excel
export const exportToExcel = (equipments: Equipment[], filename: string = 'inventaire_equipements') => {
  // Préparer les données pour l'export
  const exportData = equipments.map(equipment => ({
    'ID': equipment.id,
    'Nom': equipment.name,
    'Type': equipment.type === 'camera' ? 'Caméra' : 
           equipment.type === 'server' ? 'Serveur' : 
           equipment.type === 'switch' ? 'Switch' : equipment.type,
    'Modèle': equipment.model,
    'Statut': equipment.status === 'active' ? 'Actif' :
             equipment.status === 'maintenance' ? 'En maintenance' :
             equipment.status === 'out_of_service' ? 'Hors service' : equipment.status,
    'Latitude': equipment.latitude,
    'Longitude': equipment.longitude,
    'Date d\'installation': new Date(equipment.installationDate).toLocaleDateString('fr-FR'),
    'Dernière maintenance': equipment.lastMaintenance ? 
      new Date(equipment.lastMaintenance).toLocaleDateString('fr-FR') : 'Aucune',
    'Statut de conformité': equipment.conformityStatus === 'compliant' ? 'Conforme' :
                           equipment.conformityStatus === 'non_compliant' ? 'Non conforme' :
                           equipment.conformityStatus === 'pending' ? 'En attente' : equipment.conformityStatus,
    'Date de création': new Date(equipment.createdAt).toLocaleDateString('fr-FR'),
    'Dernière mise à jour': new Date(equipment.updatedAt).toLocaleDateString('fr-FR')
  }));

  // Créer le workbook
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  
  // Ajuster la largeur des colonnes
  const colWidths = [
    { wch: 10 }, // ID
    { wch: 30 }, // Nom
    { wch: 15 }, // Type
    { wch: 25 }, // Modèle
    { wch: 15 }, // Statut
    { wch: 12 }, // Latitude
    { wch: 12 }, // Longitude
    { wch: 18 }, // Date d'installation
    { wch: 18 }, // Dernière maintenance
    { wch: 18 }, // Statut de conformité
    { wch: 15 }, // Date de création
    { wch: 18 }  // Dernière mise à jour
  ];
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Inventaire');
  
  // Télécharger le fichier
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// Export PDF
export const exportToPDF = (equipments: Equipment[], filename: string = 'inventaire_equipements') => {
  const doc = new jsPDF('l', 'mm', 'a4'); // Format paysage
  
  // En-tête du document
  doc.setFontSize(20);
  doc.text('Inventaire des Équipements de Vidéoprotection', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, 30);
  doc.text(`Nombre total d'équipements : ${equipments.length}`, 20, 40);

  // Préparer les données pour le tableau
  const tableData = equipments.map(equipment => [
    equipment.name,
    equipment.type === 'camera' ? 'Caméra' : 
    equipment.type === 'server' ? 'Serveur' : 
    equipment.type === 'switch' ? 'Switch' : equipment.type,
    equipment.model,
    equipment.status === 'active' ? 'Actif' :
    equipment.status === 'maintenance' ? 'Maintenance' :
    equipment.status === 'out_of_service' ? 'Hors service' : equipment.status,
    `${equipment.latitude.toFixed(4)}, ${equipment.longitude.toFixed(4)}`,
    new Date(equipment.installationDate).toLocaleDateString('fr-FR'),
    equipment.lastMaintenance ? 
      new Date(equipment.lastMaintenance).toLocaleDateString('fr-FR') : 'Aucune',
    equipment.conformityStatus === 'compliant' ? 'Conforme' :
    equipment.conformityStatus === 'non_compliant' ? 'Non conforme' :
    equipment.conformityStatus === 'pending' ? 'En attente' : equipment.conformityStatus
  ]);

  // Créer le tableau
  doc.autoTable({
    head: [['Nom', 'Type', 'Modèle', 'Statut', 'Localisation', 'Installation', 'Maintenance', 'Conformité']],
    body: tableData,
    startY: 50,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246], // Bleu
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251] // Gris clair
    },
    columnStyles: {
      0: { cellWidth: 35 }, // Nom
      1: { cellWidth: 20 }, // Type
      2: { cellWidth: 30 }, // Modèle
      3: { cellWidth: 25 }, // Statut
      4: { cellWidth: 30 }, // Localisation
      5: { cellWidth: 25 }, // Installation
      6: { cellWidth: 25 }, // Maintenance
      7: { cellWidth: 25 }  // Conformité
    },
    margin: { left: 20, right: 20 }
  });

  // Ajouter un pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Page ${i} sur ${pageCount}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 10);
    doc.text('Sensicity - Plateforme de Gestion Vidéoprotection', 20, doc.internal.pageSize.height - 10);
  }

  // Télécharger le fichier
  doc.save(`${filename}.pdf`);
};

// Import Excel
export const importFromExcel = (file: File): Promise<Partial<Equipment>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Mapper les données importées vers le format Equipment
        const equipments: Partial<Equipment>[] = jsonData.map((row: any) => {
          // Fonction helper pour convertir les statuts
          const convertStatus = (status: string) => {
            const statusMap: { [key: string]: Equipment['status'] } = {
              'Actif': 'active',
              'En maintenance': 'maintenance',
              'Hors service': 'out_of_service'
            };
            return statusMap[status] || 'active';
          };

          const convertType = (type: string) => {
            const typeMap: { [key: string]: Equipment['type'] } = {
              'Caméra': 'camera',
              'Serveur': 'server',
              'Switch': 'switch'
            };
            return typeMap[type] || 'camera';
          };

          const convertConformity = (conformity: string) => {
            const conformityMap: { [key: string]: Equipment['conformityStatus'] } = {
              'Conforme': 'compliant',
              'Non conforme': 'non_compliant',
              'En attente': 'pending'
            };
            return conformityMap[conformity] || 'pending';
          };

          // Fonction helper pour parser les dates
          const parseDate = (dateStr: string) => {
            if (!dateStr || dateStr === 'Aucune') return undefined;
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            return undefined;
          };

          return {
            name: row['Nom'] || '',
            type: convertType(row['Type'] || 'Caméra'),
            model: row['Modèle'] || '',
            status: convertStatus(row['Statut'] || 'Actif'),
            latitude: parseFloat(row['Latitude']) || 0,
            longitude: parseFloat(row['Longitude']) || 0,
            installationDate: parseDate(row['Date d\'installation']) || new Date().toISOString().split('T')[0],
            lastMaintenance: parseDate(row['Dernière maintenance']),
            conformityStatus: convertConformity(row['Statut de conformité'] || 'En attente')
          };
        });

        resolve(equipments);
      } catch (error) {
        reject(new Error('Erreur lors de la lecture du fichier Excel'));
      }
    };

    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
    reader.readAsArrayBuffer(file);
  });
};

// Fonction pour valider les données importées
export const validateImportData = (equipments: Partial<Equipment>[]): { valid: Partial<Equipment>[], errors: string[] } => {
  const valid: Partial<Equipment>[] = [];
  const errors: string[] = [];

  equipments.forEach((equipment, index) => {
    const rowErrors: string[] = [];

    if (!equipment.name || equipment.name.trim() === '') {
      rowErrors.push(`Ligne ${index + 2}: Le nom est requis`);
    }

    if (!equipment.model || equipment.model.trim() === '') {
      rowErrors.push(`Ligne ${index + 2}: Le modèle est requis`);
    }

    if (equipment.latitude === undefined || equipment.latitude < -90 || equipment.latitude > 90) {
      rowErrors.push(`Ligne ${index + 2}: Latitude invalide`);
    }

    if (equipment.longitude === undefined || equipment.longitude < -180 || equipment.longitude > 180) {
      rowErrors.push(`Ligne ${index + 2}: Longitude invalide`);
    }

    if (rowErrors.length === 0) {
      valid.push(equipment);
    } else {
      errors.push(...rowErrors);
    }
  });

  return { valid, errors };
};