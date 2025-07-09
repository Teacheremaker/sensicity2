import React, { useState, useRef } from 'react';
import { Download, Upload, FileSpreadsheet, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Equipment } from '../../types';
import { exportToExcel, exportToPDF, importFromExcel, validateImportData } from '../../utils/exportUtils';

interface ImportExportActionsProps {
  equipments: Equipment[];
  onImport: (equipments: Partial<Equipment>[]) => Promise<void>;
}

export const ImportExportActions: React.FC<ImportExportActionsProps> = ({ equipments, onImport }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; errors: string[] } | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportExcel = () => {
    exportToExcel(equipments, `inventaire_equipements_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportPDF = () => {
    exportToPDF(equipments, `inventaire_equipements_${new Date().toISOString().split('T')[0]}`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResults(null);

    try {
      const importedData = await importFromExcel(file);
      const { valid, errors } = validateImportData(importedData);

      if (valid.length > 0) {
        await onImport(valid);
        setImportResults({
          success: valid.length,
          errors
        });
      } else {
        setImportResults({
          success: 0,
          errors: errors.length > 0 ? errors : ['Aucune donnée valide trouvée dans le fichier']
        });
      }

      setShowImportModal(true);
    } catch (error) {
      setImportResults({
        success: 0,
        errors: [error instanceof Error ? error.message : 'Erreur lors de l\'import']
      });
      setShowImportModal(true);
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    const templateData = [{
      'Nom': 'Exemple Caméra 001',
      'Type': 'Caméra',
      'Modèle': 'Hikvision DS-2CD2143G0-I',
      'Statut': 'Actif',
      'Latitude': 48.8566,
      'Longitude': 2.3522,
      'Date d\'installation': '15/06/2023',
      'Dernière maintenance': '10/01/2024',
      'Statut de conformité': 'Conforme'
    }];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'template_import_equipements.xlsx');
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        {/* Export Excel */}
        <button
          onClick={handleExportExcel}
          className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          title="Exporter en Excel"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Excel
        </button>

        {/* Export PDF */}
        <button
          onClick={handleExportPDF}
          className="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          title="Exporter en PDF"
        >
          <FileText className="h-4 w-4 mr-2" />
          PDF
        </button>

        {/* Import */}
        <button
          onClick={handleImportClick}
          disabled={isImporting}
          className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Importer depuis Excel"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isImporting ? 'Import...' : 'Importer'}
        </button>

        {/* Template */}
        <button
          onClick={downloadTemplate}
          className="flex items-center px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          title="Télécharger le modèle Excel"
        >
          <Download className="h-4 w-4 mr-2" />
          Modèle
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Import Results Modal */}
      {showImportModal && importResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Résultats de l'import</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Success message */}
              {importResults.success > 0 && (
                <div className="flex items-center p-4 mb-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">
                      {importResults.success} équipement(s) importé(s) avec succès
                    </p>
                  </div>
                </div>
              )}

              {/* Errors */}
              {importResults.errors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    <h3 className="font-medium text-red-900">
                      Erreurs détectées ({importResults.errors.length})
                    </h3>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    <ul className="text-sm text-red-700 space-y-1">
                      {importResults.errors.map((error, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block w-2 h-2 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Instructions pour l'import :</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Utilisez le modèle Excel fourni</li>
                  <li>• Respectez les formats de dates (JJ/MM/AAAA)</li>
                  <li>• Les coordonnées GPS doivent être en format décimal</li>
                  <li>• Les champs Nom et Modèle sont obligatoires</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};