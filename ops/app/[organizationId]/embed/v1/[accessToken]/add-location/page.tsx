import { Stack } from "@mantine/core";
import AddLocationForm from "~/components/location-listing-add-location/addLocationForm";

const AddLocationFormPage = () => {
  return (
    <Stack gap="xl" p="md">
      <div>
        <AddLocationForm />
      </div>
    </Stack>
  );
};

export default AddLocationFormPage;
