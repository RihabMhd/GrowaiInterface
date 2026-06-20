import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import IntegrationBuilderModal from '../components/integration-builder/IntegrationBuilderModal';

export default function CompanyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <IntegrationBuilderModal
      carrierId={id}
      onClose={() => navigate('/companies')}
    />
  );
}