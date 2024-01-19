import * as select from "@zag-js/combobox";
import { normalizeProps, useMachine } from "@zag-js/solid";
import {
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  For,
  Show,
} from "solid-js";

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type SelectProps = {
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
};

export function Select(props: SelectProps) {
  const [options, setOptions] = createSignal<SelectOption[]>([]);
  createEffect(() => {
    setOptions(props.options);
  });

  const collection = createMemo(() =>
    select.collection({
      items: options(),
      itemToValue: (item) => item.value,
      itemToString: (item) => item.label,
      isItemDisabled: (item) => !!item?.disabled,
    }),
  );

  const [state, send] = useMachine(
    select.machine({
      id: createUniqueId(),
      collection: collection(),
      onOpenChange() {
        setOptions(props.options);
      },
      onInputValueChange({ value }) {
        const filtered = props.options.filter((item) =>
          item.label.toLowerCase().includes(value.toLowerCase()),
        );
        setOptions(filtered.length > 0 ? filtered : props.options);
      },
      onValueChange({ value }) {
        if (props.onChange) props.onChange(value[0]);
      },
      allowCustomValue: true,
      selectionBehavior: "replace",
      value: [props.value ?? ""],
      closeOnSelect: true,
      openOnClick: true,
    }),
  );

  const api = createMemo(() => select.connect(state, send, normalizeProps));

  return (
    <div>
      <div {...api().rootProps}>
        <label {...api().labelProps}>Select country</label>
        <div {...api().controlProps}>
          <input {...api().inputProps} />
          <button {...api().triggerProps}>▼</button>
        </div>
      </div>
      <div {...api().positionerProps}>
        <Show when={options().length > 0}>
          <ul {...api().contentProps}>
            <For each={options()}>
              {(item) => (
                <li {...api().getItemProps({ item })}>{item.label}</li>
              )}
            </For>
          </ul>
        </Show>
      </div>
    </div>
  );
}
