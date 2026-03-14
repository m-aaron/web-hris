import { useFormContext, useFieldArray } from "react-hook-form";
import InputForm from "../../InputForm";
import Button from "../../Button";
import { toast } from "sonner";

const EducationCard = ({ index, savingRow, openSaveConfirm, setDeleteIndex, isDirty }) => {

  const { register, control, formState: { errors }, watch } = useFormContext();

  const majors = useFieldArray({
    control,
    name: `education.${index}.majors`,
  });

  const minors = useFieldArray({
    control,
    name: `education.${index}.minors`,
  });

  const honors = useFieldArray({
    control,
    name: `education.${index}.honors`,
  });

  const scholarships = useFieldArray({
    control,
    name: `education.${index}.scholarships`,
  });


  const educationErrors = errors.education?.[index];
  const educationId = watch(`education.${index}.id`);


  return (

    <div
      className={`border rounded-lg p-4 space-y-6 ${isDirty ? "border-yellow bg-yellow/5" : "border-border"}`}
    >

      <div className="flex justify-between">

        <h4 className="text-sm text-heading font-medium flex items-center gap-2">
          Education {index + 1}{" "}
          {isDirty && <span className="text-xs text-yellow">Unsaved</span>}
        </h4>

        <div className="flex gap-2">

          <Button
            type="button"
            size="small"
            onClick={() => openSaveConfirm(index)}
            disabled={savingRow === index}
          >
            Save
          </Button>

          <Button
            type="button"
            size="small"
            variant="outline"
            onClick={() => setDeleteIndex(index)}
          >
            Delete
          </Button>
        </div>

      </div>


      {/* Education fields */}
      <div className="grid grid-cols-2 gap-4">

        <InputForm
          label="Degree / Title / Certificate"
          required
          message={educationErrors?.title?.message}
          {...register(`education.${index}.title`)}
        />

        <InputForm
          label="School / College"
          required
          message={educationErrors?.school?.message}
          {...register(`education.${index}.school`)}
        />

        <InputForm
          label="Year Started"
          type="number"
          maxLength={4}
          message={educationErrors?.year_started?.message}
          {...register(`education.${index}.year_started`)}
        />

        <InputForm
          label="Year Finished"
          type="number"
          maxLength={4}
          message={educationErrors?.year_finished?.message}
          {...register(`education.${index}.year_finished`)}
        />

      </div>


      {/* Dynamic nested sections */}
      <NestedSection
        title="Majors"
        fieldArray={majors}
        register={register}
        path={`education.${index}.majors`}
        isParentSaved={!!educationId}
      />

      <NestedSection
        title="Minors"
        fieldArray={minors}
        register={register}
        path={`education.${index}.minors`}
        isParentSaved={!!educationId}
      />

      <NestedSection
        title="Honors"
        fieldArray={honors}
        register={register}
        path={`education.${index}.honors`}
        isParentSaved={!!educationId}
      />

      <NestedSection
        title="Scholarships / Grants"
        fieldArray={scholarships}
        register={register}
        path={`education.${index}.scholarships`}
        isParentSaved={!!educationId}
      />

    </div>

  );

};


export default EducationCard;


const NestedSection = ({ title, fieldArray, register, path, isParentSaved }) => {

  const handleAdd = () => {
    if (!isParentSaved) {
      toast.warning(
        `Please save the Education details first before adding ${title}.`,
      );
      return;
    }
    fieldArray.append({ name: "" });
  };

  return (

    <div>

      <div className="flex justify-between mb-2">

        <h5 className="text-xs font-semibold uppercase text-muted">{title}</h5>

        <Button type="button" size="small" onClick={handleAdd}>
          + Add
        </Button>

      </div>

      {fieldArray.fields.map((item, i) => (
        <div key={item.id} className="flex items-end gap-2 mb-2">
          <InputForm
            label={title.slice(0, -1)}
            {...register(`${path}.${i}.name`)}
          />

          <Button
            type="button"
            size="small"
            variant="outline"
            onClick={() => fieldArray.remove(i)}
          >
            Delete
          </Button>

        </div>
      ))}

    </div>

  );
  
};
