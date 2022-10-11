# rename docker file
sed -i 's/staging/stage3/g;s/stage1/stage3/g;s/stage2/stage3/g;s/stage4/stage3/g;' dockerfile
# generate image
docker build -t stage3_umobile_app_payment_management .
# tag image
docker tag stage3_umobile_app_payment_management asia.gcr.io/um-stage-3/stage3_umobile_app_payment_management:v$1
# push image
docker push asia.gcr.io/um-stage-3/stage3_umobile_app_payment_management:v$1