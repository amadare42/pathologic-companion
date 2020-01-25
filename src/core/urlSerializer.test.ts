import { fromB64, toB64, urlSerializer } from './gameActionsUrlSerializer';

test('to', () => {
    let input = '001';
    let b64 = toB64(input);
    let parsed = fromB64(b64);

    console.log(input, b64, parsed);
});

test('to actions', () => {
    let output = urlSerializer.serialize([{
        type: 'movement',
        to: 4
    }]);
    let value = fromB64(output);
    let parsed = urlSerializer.deserialize(output);
    console.log(output, value, parsed);
})
